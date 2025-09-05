const prisma = require('../config/db.js');
const asynerror = require('../utili/asyncerror.js');
const handleError = require('../utili/errorhandle.js');
const {PRICETYPE} = require('@prisma/client');
const winston = require('winston');
const  { queueNotificationsForNewTender } = require('../utili/generateNotification.js');
const fs = require('fs');
const path = require('path');

const createtender = asynerror(async (req, res, next) => {
  const {
    title,
    description,
    biddingOpen,
    biddingClosed,
    categoryName,
    subcategoryName,
    type,
    tenderDocs = [],
    biddingDocs = [],
  } = req.body;

  const parseField = (field) => {
    try {
      return Array.isArray(field) ? field : JSON.parse(field || '[]');
    } catch (e) {
      console.error(`Failed to parse field: ${field}`, e);
      return [];
    }
  };

  const cleanDate = (value) => {
    if (!value) return null;
    const unquoted = typeof value === 'string' ? value.replace(/^"|"$/g, '') : value;
    const parsed = new Date(unquoted);
    return isNaN(parsed) ? null : parsed;
  };

  const allowedTypes = ['FREE', 'PAID'];
  const cleanType = (value) => {
    if (!value) return 'FREE';
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'string' && allowedTypes.includes(parsed)) {
          return parsed;
        }
      } catch {
        // Not JSON stringified
      }
      if (allowedTypes.includes(value)) {
        return value;
      }
    }
    return 'FREE';
  };

  const parsedTenderDocs = parseField(tenderDocs);
  const parsedBiddingDocs = parseField(biddingDocs);

  const openDate = cleanDate(biddingOpen);
  const closeDate = cleanDate(biddingClosed);

  if (!title || !description || !openDate || !closeDate) {
    return next(
      new handleError(
        'All fields (title, description, biddingOpen, biddingClosed) are required and must be valid dates',
        400
      )
    );
  }

  const tenderDocFiles = [];
  const biddingDocFiles = [];
  for (const file of req.files || []) {
    if (file.fieldname.startsWith('tenderDocsFiles')) {
      tenderDocFiles.push(file);
    } else if (file.fieldname.startsWith('biddingDocsFiles')) {
      biddingDocFiles.push(file);
    }
  }

  for (const doc of parsedTenderDocs) {
    if (doc.file) {
      return next(new handleError('tenderDocs should not contain a file field', 400));
    }
    if (!doc.name || !doc.title || !doc.type) {
      return next(new handleError('Each tenderDoc must have name, title, and type', 400));
    }
  }

  for (const doc of parsedBiddingDocs) {
    if (doc.file) {
      return next(new handleError('biddingDocs should not contain a file field', 400));
    }
    if (!doc.title || !doc.description || !doc.company || !doc.type) {
      return next(new handleError('Each biddingDoc must have title, description, company, and type', 400));
    }
  }

  if (tenderDocFiles.length !== parsedTenderDocs.length) {
    return next(
      new handleError(
        `Number of tenderDoc files (${tenderDocFiles.length}) does not match tenderDocs metadata (${parsedTenderDocs.length})`,
        400
      )
    );
  }

  if (biddingDocFiles.length !== parsedBiddingDocs.length) {
    return next(
      new handleError(
        `Number of biddingDoc files (${biddingDocFiles.length}) does not match biddingDocs metadata (${parsedBiddingDocs.length})`,
        400
      )
    );
  }

  try {
    const tender = await prisma.$transaction(async (tx) => {
      let category = await tx.category.findFirst({ where: { name: categoryName } });
      if (!category) {
        category = await tx.category.create({
          data: { name: categoryName, createdAt: new Date() },
        });
      }

      let subcategory = await tx.subcategory.findFirst({
        where: { name: subcategoryName, categoryId: category.id },
      });
      if (!subcategory) {
        subcategory = await tx.subcategory.create({
          data: {
            name: subcategoryName,
            categoryId: category.id,
            createdAt: new Date(),
          },
        });
      }

      const createdTender = await tx.tender.create({
        data: {
          title,
          description,
          biddingOpen: openDate,
          biddingClosed: closeDate,
          type: cleanType(type),
          category: { connect: { id: category.id } },
          subcategory: { connect: { id: subcategory.id } },
          tenderDocs: {
            create: parsedTenderDocs.map((doc, i) => ({
              name: doc.name,
              title: doc.title,
              file: tenderDocFiles[i]?.filename || '',
              price: doc.price ? parseFloat(doc.price) : null,
              type: doc.type,
              createdAt: new Date(),
            })),
          },
          biddingDocs: {
            create: parsedBiddingDocs.map((doc, i) => ({
              title: doc.title,
              description: doc.description,
              company: doc.company,
              file: biddingDocFiles[i]?.filename || '',
              price: doc.price ? parseFloat(doc.price) : null,
              type: doc.type,
            })),
          },
        },
        include: {
          category: true,
          subcategory: true,
          tenderDocs: true,
          biddingDocs: true,
        },
      });

      return createdTender;
    });

    console.log('Manually triggering notifications for tender:', tender.title);
    await queueNotificationsForNewTender(tender);

    res.status(201).json({
      status: 'success',
      message: 'Tender created successfully',
      data: tender,
    });
  } catch (error) {
    console.error('Failed to create tender:', error);
    return next(new handleError(`Failed to create tender: ${error.message}`, 500));
  }
});


const getAllTenders = asynerror(async (req, res, next) => {
  const { page = 1, limit = 15, categoryId, subcategoryId } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  const orConditions = [];

  if (categoryId) {
    const categoryIds = Array.isArray(categoryId)
      ? categoryId.map((id) => parseInt(id)).filter((id) => !isNaN(id))
      : [parseInt(categoryId)].filter((id) => !isNaN(id));
    if (categoryIds.length > 0) {
      orConditions.push({ categoryId: { in: categoryIds } });
    }
  }

  if (subcategoryId) {
    const subcategoryIds = Array.isArray(subcategoryId)
      ? subcategoryId.map((id) => parseInt(id)).filter((id) => !isNaN(id))
      : [parseInt(subcategoryId)].filter((id) => !isNaN(id));
    if (subcategoryIds.length > 0) {
      orConditions.push({ subcategoryId: { in: subcategoryIds } });
    }
  }

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  try {
    const [tenders, total] = await Promise.all([
      prisma.tender.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          category: true,
          subcategory: true,
          postedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          tenderDocs: true,
          biddingDocs: true,
        },
        orderBy: { biddingOpen: 'desc' },
      }),
      prisma.tender.count({ where }),
    ]);

    const formattedTenders = tenders.map((tender) => {
      return {
        id: tender.id,
        title: tender.title,
        category: tender.category?.name || 'Unknown',
        subcategory: tender.subcategory?.name || 'Unknown',
        biddingOpen: tender.biddingOpen.toISOString(),
        biddingClosed: tender.biddingClosed.toISOString(),
        description: tender.description,
        type: tender.type,
        tenderDocs: tender.tenderDocs.map((doc) => ({
          name: doc.name,
          title: doc.title,
          type: doc.type,
          price: doc.price ? doc.price.toString() : '',
          file:doc.file
        })),
        biddingDocs: tender.biddingDocs.map((doc) => ({
          title: doc.title,
          description: doc.description,
          company: doc.company,
          type: doc.type,
          price: doc.price ? doc.price.toString() : '',
          file:doc.file

        })),
        postedBy: tender.postedBy || null,
        approvedBy: tender.approvedBy || null,
      };
    });

    res.json({
      status: 'success',
      data: formattedTenders,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch tenders:', error);
    return next(new handleError(`Failed to fetch tenders: ${error.message}`, 500));
  }
});

// Controller: Get Tender by ID
const getTenderById = asynerror(async (req, res, next) => {
  const tenderId = parseInt(req.params.id, 10);

  if (isNaN(tenderId)) {
    return next(new handleError('Invalid tender ID', 400));
  }

  try {
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        category: true,
        subcategory: true,
        region: true,
        postedBy: {
          select: { id: true, firstName: true, lastName: true, email: true, phoneNo: true },
        },
        approvedBy: {
          select: { id: true, firstName: true, lastName: true, email: true, phoneNo: true },
        },
        tenderDocs: true,
        biddingDocs: true,
      },
    });

    if (!tender) {
      return next(new handleError('Tender not found', 404));
    }

    // Format response to match frontend expectations
    const formattedTender = {
      id: tender.id,
      title: tender.title,
      description: tender.description || '',
      biddingOpen: tender.biddingOpen.toISOString(),
      biddingClosed: tender.biddingClosed.toISOString(),
      categoryId: tender.categoryId,
      category: tender.category
        ? { id: tender.category.id, name: tender.category.name, createdAt: tender.category.createdAt }
        : null,
      subcategoryId: tender.subcategoryId,
      subcategory: tender.subcategory
        ? {
            id: tender.subcategory.id,
            name: tender.subcategory.name,
            createdBy: tender.subcategory.createdBy,
            createdAt: tender.subcategory.createdAt,
            categoryId: tender.subcategory.categoryId,
          }
        : null,
      regionId: tender.regionId,
      region: tender.region
        ? { id: tender.region.id, name: tender.region.name, createdAt: tender.region.createdAt }
        : null,
      postedById: tender.postedById,
      postedBy: tender.postedBy
        ? {
            id: tender.postedBy.id,
            firstName: tender.postedBy.firstName,
            lastName: tender.postedBy.lastName,
            email: tender.postedBy.email,
            phoneNo: tender.postedBy.phoneNo,
          }
        : null,
      approvedById: tender.approvedById,
      approvedBy: tender.approvedBy
        ? {
            id: tender.approvedBy.id,
            firstName: tender.approvedBy.firstName,
            lastName: tender.approvedBy.lastName,
            email: tender.approvedBy.email,
            phoneNo: tender.approvedBy.phoneNo,
          }
        : null,
      approvedAt: tender.approvedAt ? tender.approvedAt.toISOString() : null,
      type: tender.type,
      tenderDocs: tender.tenderDocs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        title: doc.title,
        file: doc.file,
        price: doc.price ? doc.price.toString() : null,
        type: doc.type,
        createdAt: doc.createdAt.toISOString(),
        tenderId: doc.tenderId,
      })),
      biddingDocs: tender.biddingDocs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description || '',
        company: doc.company,
        file: doc.file,
        price: doc.price ? doc.price.toString() : null,
        type: doc.type,
        tenderId: doc.tenderId,
      })),
    };

    res.json({
      status: 'success',
      data: formattedTender,
    });
  } catch (error) {
    console.error('Failed to fetch tender:', error);
    return next(new handleError(`Failed to fetch tender: ${error.message}`, 500));
  }
});


// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'tender.log' }),
    new winston.transports.Console(),
  ],
});

// Centralized file deletion helper
const deleteFileIfExists = async (filename) => {
  if (!filename) return;
  try {
    const filePath = path.join(__dirname, '../Uploads', filename);
    if (await fs.access(filePath).then(() => true).catch(() => false)) {
      await fs.unlink(filePath);
      logger.info(`Deleted file: ${filename}`);
    }
  } catch (error) {
    logger.error(`Failed to delete file ${filename}: ${error.message}`);
  }
};

// Validate file type
const validateFileType = (file) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    logger.error(`Invalid file type: ${file.originalname}`);
    throw new handleError(`Invalid file type for ${file.originalname}. Allowed: PDF, DOC, DOCX`, 400);
  }
};

// Main updateTender function
const updateTender = asynerror(async (req, res, next) => {
  const {
    title,
    description,
    biddingOpen,
    biddingClosed,
    categoryName,
    subcategoryName,
    type,
    tenderDocs = '[]',
    biddingDocs = '[]',
  } = req.body;

  const { id } = req.params;

  // Validate tender ID
  const tenderId = parseInt(id);
  if (isNaN(tenderId) || tenderId <= 0) {
    logger.error(`Invalid tender ID: ${id}`);
    throw new handleError(`Invalid tender ID: ${id}`, 400);
  }

  logger.info(`Starting tender update for ID: ${tenderId}`);

  // Parse JSON fields with validation
  const parseField = (field, fieldName) => {
    try {
      const parsed = Array.isArray(field) ? field : JSON.parse(field);
      if (!Array.isArray(parsed)) throw new Error('Not an array');
      return parsed;
    } catch (error) {
      logger.error(`Invalid ${fieldName} format: ${error.message}`);
      throw new handleError(`Invalid ${fieldName} format`, 400);
    }
  };

  const parsedTenderDocs = parseField(tenderDocs, 'tenderDocs');
  const parsedBiddingDocs = parseField(biddingDocs, 'biddingDocs');

  // Validate and clean date inputs
  const cleanDate = (value) => {
    if (!value) return null;
    const cleaned = typeof value === 'string' ? value.replace(/^"|"$/g, '') : value;
    const parsed = new Date(cleaned);
    if (isNaN(parsed)) {
      logger.error(`Invalid date format: ${value}`);
      throw new handleError(`Invalid date format for ${value}`, 400);
    }
    return parsed;
  };

  // Validate tender type
  const cleanType = (value) => {
    const allowedTypes = ['FREE', 'PAID'];
    const cleaned = typeof value === 'string' ? value.toUpperCase() : 'FREE';
    if (!allowedTypes.includes(cleaned)) {
      logger.warn(`Invalid tender type ${value}, defaulting to FREE`);
      return 'FREE';
    }
    return cleaned;
  };

  const openDate = cleanDate(biddingOpen);
  const closeDate = cleanDate(biddingClosed);
  const tenderType = cleanType(type);

  // Organize uploaded files
  const tenderDocFiles = [];
  const biddingDocFiles = [];
  (req.files || []).forEach(file => {
    validateFileType(file);
    if (file.fieldname.startsWith('tenderDocsFiles')) tenderDocFiles.push(file);
    else if (file.fieldname.startsWith('biddingDocsFiles')) biddingDocFiles.push(file);
  });

  logger.info(`Received ${tenderDocFiles.length} tender files and ${biddingDocFiles.length} bidding files`);

  // Validate file counts against metadata
  parsedTenderDocs.forEach((doc, i) => {
    if (doc.fileRequired && !tenderDocFiles[i] && !doc.existingFile) {
      logger.error(`Missing file for tender document at index ${i}`);
      throw new handleError(`Missing file for tender document at index ${i}`, 400);
    }
  });
  parsedBiddingDocs.forEach((doc, i) => {
    if (doc.fileRequired && !biddingDocFiles[i] && !doc.existingFile) {
      logger.error(`Missing file for bidding document at index ${i}`);
      throw new handleError(`Missing file for bidding document at index ${i}`, 400);
    }
  });

  // Fetch existing tender
  const oldTender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: { tenderDocs: true, biddingDocs: true },
  });

  if (!oldTender) {
    logger.error(`Tender not found for ID: ${tenderId}`);
    throw new handleError(`Tender not found for ID: ${tenderId}`, 404);
  }

  try {
    const updatedTender = await prisma.$transaction(async (tx) => {
      // Handle category
      let category = await tx.category.findFirst({ where: { name: categoryName } });
      if (!category) {
        category = await tx.category.create({
          data: { name: categoryName, createdAt: new Date() },
        });
        logger.info(`Created new category: ${categoryName}`);
      }

      // Handle subcategory
      let subcategory = await tx.subcategory.findFirst({
        where: { name: subcategoryName, categoryId: category.id },
      });
      if (!subcategory) {
        subcategory = await tx.subcategory.create({
          data: { name: subcategoryName, categoryId: category.id, createdAt: new Date() },
        });
        logger.info(`Created new subcategory: ${subcategoryName}`);
      }

      // Delete old documents if new metadata is provided
      if (parsedTenderDocs.length > 0) {
        await Promise.all(oldTender.tenderDocs.map(doc => deleteFileIfExists(doc.file)));
        await tx.tenderDoc.deleteMany({ where: { tenderId: tenderId } });
        logger.info(`Deleted ${oldTender.tenderDocs.length} existing tender documents for tender ID: ${tenderId}`);
      }

      if (parsedBiddingDocs.length > 0) {
        await Promise.all(oldTender.biddingDocs.map(doc => deleteFileIfExists(doc.file)));
        await tx.biddingDoc.deleteMany({ where: { tenderId: tenderId } });
        logger.info(`Deleted ${oldTender.biddingDocs.length} existing bidding documents for tender ID: ${tenderId}`);
      }

      // Update tender
      const updatedTender = await tx.tender.update({
        where: { id: tenderId },
        data: {
          title,
          description,
          biddingOpen: openDate,
          biddingClosed: closeDate,
          type: tenderType,
          category: { connect: { id: category.id } },
          subcategory: { connect: { id: subcategory.id } },
          tenderDocs: {
            create: parsedTenderDocs
              .filter(doc => doc.name && doc.title && doc.type)
              .map((doc, i) => ({
                name: doc.name,
                title: doc.title,
                type: doc.type,
                file: tenderDocFiles[i]?.filename || doc.existingFile || '',
                price: doc.price ? parseFloat(doc.price) : null,
                createdAt: new Date(),
              })),
          },
          biddingDocs: {
            create: parsedBiddingDocs
              .filter(doc => doc.title && doc.description && doc.company && doc.type)
              .map((doc, i) => ({
                title: doc.title,
                description: doc.description,
                company: doc.company,
                type: doc.type,
                file: biddingDocFiles[i]?.filename || doc.existingFile || '',
                price: doc.price ? parseFloat(doc.price) : null,
                createdAt: new Date(),
              })),
          },
        },
        include: {
          tenderDocs: true,
          biddingDocs: true,
          category: true,
          subcategory: true,
        },
      });

      logger.info(`Tender updated successfully: ID ${tenderId}`);
      return updatedTender;
    });

    res.status(200).json({
      message: 'Tender updated successfully',
      tender: {
        id: updatedTender.id,
        title: updatedTender.title,
        description: updatedTender.description,
        biddingOpen: updatedTender.biddingOpen,
        biddingClosed: updatedTender.biddingClosed,
        type: updatedTender.type,
        category: updatedTender.category.name,
        subcategory: updatedTender.subcategory.name,
        tenderDocs: updatedTender.tenderDocs,
        biddingDocs: updatedTender.biddingDocs,
      },
    });
  } catch (error) {
    logger.error(`Error updating tender ID ${tenderId}: ${error.message}`);
    next(error instanceof handleError ? error : new handleError('Failed to update tender', 500));
  }
});


// const deleteTender = asynerror(async (req, res, next) => {
//   await prisma.$transaction(async (tx) => {
//     const tender = await tx.tender.findUnique({ where: { id: parseInt(req.params.id) } });
//     if (!tender) {
//       return next(new handleError('Tender not found', 404));
//     }

//     await tx.tender.delete({ where: { id: parseInt(req.params.id) } });

//     await tx.activityLog.create({
//       data: {
//         method: 'DELETE',
//         role: req.user.role,
//         action: 'DELETE_TENDER',
//         userId: req.user.id,
//         detail: `Deleted tender ID: ${req.params.id}`,
//         createdAt: new Date(),
//       },
//     });
//   });

//   res.status(204).json({ status: 'success', message: 'Tender deleted successfully' });
// });

// const getpostedbytender = asynerror(async (req, res, next) => {
//   const tenders = await prisma.tender.findMany({
//     where: { postedById: req.user.id },
//     include: { postedBy: true },
//   });

//   if (!tenders || tenders.length === 0) {
//     return next(new handleError('No tenders found for this user', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tenders } });
// });

// const gettenderbycategory = asynerror(async (req, res, next) => {
//   const { categoryId } = req.params;

//   const tenders = await prisma.tender.findMany({
//     where: { categoryId: parseInt(categoryId) },
//     include: { postedBy: true },
//   });

//   if (!tenders || tenders.length === 0) {
//     return next(new handleError('No tenders found for this category', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tenders } });
// });

// const getapprovedByIdtender = asynerror(async (req, res, next) => {
//   const { id } = req.params;

//   const tender = await prisma.tender.findUnique({
//     where: { id: parseInt(id) },
//     include: { approvedBy: true },
//   });

//   if (!tender) {
//     return next(new handleError('Tender not found', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tender } });
// });

// const gettenderbysubcatagory = asynerror(async (req, res, next) => {
//   const { subcategoryId } = req.params;

//   const tenders = await prisma.tender.findMany({
//     where: { subcategoryId: parseInt(subcategoryId) },
//     include: { postedBy: true },
//   });

//   if (!tenders || tenders.length === 0) {
//     return next(new handleError('No tenders found for this subcategory', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tenders } });
// });

// const getfreetender = asynerror(async (req, res, next) => {
//   const tenders = await prisma.tender.findMany({
//     where: { type: 'FREE' },
//     include: { postedBy: true },
//   });

//   if (!tenders || tenders.length === 0) {
//     return next(new handleError('No free tenders found', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tenders } });
// });

// const getpaidtender = asynerror(async (req, res, next) => {
//   const tenders = await prisma.tender.findMany({
//     where: { type: 'PAID' },
//     include: { postedBy: true },
//   });

//   if (!tenders || tenders.length === 0) {
//     return next(new handleError('No paid tenders found', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tenders } });
// });

// const getexpiredtender = asynerror(async (req, res, next) => {
//   const currentDate = new Date();

//   const tenders = await prisma.tender.findMany({
//     where: { biddingClosed: { lt: currentDate } },
//     include: { postedBy: true },
//   });

//   if (!tenders || tenders.length === 0) {
//     return next(new handleError('No expired tenders found', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tenders } });
// });

// const getactiveTender = asynerror(async (req, res, next) => {
//   const currentDate = new Date();

//   const tenders = await prisma.tender.findMany({
//     where: { biddingClosed: { gte: currentDate } },
//     include: { postedBy: true },
//   });

//   if (!tenders || tenders.length === 0) {
//     return next(new handleError('No active tenders found', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tenders } });
// });

// const gettendetincataandsub = asynerror(async (req, res, next) => {
//   const { subcategoryId, categoryId } = req.params;

//   if (!subcategoryId || !categoryId) {
//     return next(new handleError('Subcategory ID and Category ID are required', 400));
//   }

//   const tenders = await prisma.tender.findMany({
//     where: { subcategoryId: parseInt(subcategoryId), categoryId: parseInt(categoryId) },
//     include: { category: true, subcategory: true },
//   });

//   if (!tenders || tenders.length === 0) {
//     return next(new handleError('No tenders found for the given subcategory and category', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tenders } });
// });

// const getTendersByCategoryStats = asynerror(async (req, res, next) => {
//   const data = await prisma.tender.groupBy({
//     by: ['categoryId'],
//     _count: { id: true },
//   });

//   const categories = await prisma.category.findMany({
//     where: { id: { in: data.map((d) => d.categoryId) } },
//     select: { id: true, name: true },
//   });

//   const chartData = {
//     type: 'bar',
//     data: {
//       labels: categories.map((c) => c.name),
//       datasets: [
//         {
//           label: 'Tenders per Category',
//           data: data.map((d) => d._count.id),
//           backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
//         },
//       ],
//     },
//     options: {
//       scales: {
//         y: { beginAtZero: true, title: { display: true, text: 'Number of Tenders' } },
//         x: { title: { display: true, text: 'Category' } },
//       },
//     },
//   };

//   res.json({ status: 'success', data: chartData });
// });

module.exports = {
  createtender,
  getAllTenders,updateTender,getTenderById
  // createTenderNoFiles,
  // getAllTenders,
  // getTenderById,
  // updateTender,
  // deleteTender,
  // getpostedbytender,
  // gettenderbycategory,
  // getapprovedByIdtender,
  // gettenderbysubcatagory,
  // getfreetender,
  // getpaidtender,
  // getexpiredtender,
  // getactiveTender,
  // gettendetincataandsub,
  // getTendersByCategoryStats,
};