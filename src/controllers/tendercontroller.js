const prisma = require('../config/db.js');
const asynerror = require('../utili/asyncerror.js');
const handleError = require('../utili/errorhandle.js');
const {PRICETYPE} = require('@prisma/client');
const winston = require('winston');

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

  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

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

  // Group indexed files
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
              file: tenderDocFiles[i]?.path || '',
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
              file: biddingDocFiles[i]?.path || '',
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


// const createTenderNoFiles = asynerror(async (req, res, next) => {
//   const {
//     title,
//     description,
//     biddingOpen,
//     biddingClosed,
//     categoryName,
//     subcategoryName,
//     type,
//     tenderDocs = [],
//     biddingDocs = [],
//     reminders = [],
//   } = req.body;

//   const tender = await prisma.$transaction(async (tx) => {
//     let category = await tx.category.findUnique({ where: { name: categoryName } });
//     if (!category) {
//       category = await tx.category.create({
//         data: { name: categoryName, createdAt: new Date() },
//       });
//       winston.info(`Created category: ${categoryName} (ID: ${category.id})`);
//     }

//     let subcategory = await tx.subcategory.findFirst({
//       where: { name: subcategoryName, categoryId: category.id },
//     });
//     if (!subcategory) {
//       subcategory = await tx.subcategory.create({
//         data: {
//           name: subcategoryName,
//           categoryId: category.id,
//           createdBy: req.user.id,
//           createdAt: new Date(),
//         },
//       });
//       winston.info(`Created subcategory: ${subcategoryName} (ID: ${subcategory.id}) for category ID ${category.id}`);
//     }

//     const tender = await tx.tender.create({
//       data: {
//         title,
//         description,
//         biddingOpen: new Date(biddingOpen),
//         biddingClosed: new Date(biddingClosed),
//         categoryId: category.id,
//         subcategoryId: subcategory.id,
//         postedById: req.user.id,
//         type,
//         tenderDocs: {
//           create: tenderDocs.map((doc) => ({
//             name: doc.name,
//             title: doc.title,
//             file: doc.file,
//             price: doc.price ? parseFloat(doc.price) : null,
//             type: doc.type,
//             createdAt: new Date(),
//           })),
//         },
//         biddingDocs: {
//           create: biddingDocs.map((doc) => ({
//             title: doc.title,
//             description: doc.description,
//             company: doc.company,
//             file: doc.file,
//             price: doc.price ? parseFloat(doc.price) : null,
//             type: doc.type,
//           })),
//         },
//         reminders: {
//           create: reminders.map((reminder) => ({
//             dueDate: new Date(reminder.dueDate),
//             type: reminder.type,
//             userId: req.user.id,
//           })),
//         },
//       },
//       include: {
//         category: true,
//         subcategory: true,
//         postedBy: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
//         approvedBy: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
//         tenderDocs: true,
//         biddingDocs: true,
//         reminders: true,
//       },
//     });

//     await tx.activityLog.create({
//       data: {
//         method: 'POST',
//         role: req.user.role,
//         action: 'CREATE_TENDER',
//         userId: req.user.id,
//         detail: `Created tender: ${title} (ID: ${tender.id})`,
//         createdAt: new Date(),
//       },
//     });

//     return tender;
//   });

//   res.status(201).json({
//     status: 'success',
//     data: tender,
//     message: 'Tender created successfully',
//   });
// });

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
        })),
        biddingDocs: tender.biddingDocs.map((doc) => ({
          title: doc.title,
          description: doc.description,
          company: doc.company,
          type: doc.type,
          price: doc.price ? doc.price.toString() : '',
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

// const getTenderById = asynerror(async (req, res, next) => {
//   const tender = await prisma.tender.findUnique({
//     where: { id: parseInt(req.params.id) },
//     include: {
//       category: true,
//       subcategory: true,
//       postedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
//       approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
//       tenderDocs: true,
//       biddingDocs: true,
//       reminders: true,
//     },
//   });

//   if (!tender) {
//     return next(new handleError('Tender not found', 404));
//   }

//   res.json({ status: 'success', data: tender });
// });

// const updateTender = asynerror(async (req, res, next) => {
//   const {
//     title,
//     description,
//     biddingOpen,
//     biddingClosed,
//     categoryName,
//     subcategoryName,
//     type,
//     tenderDocs = [],
//     biddingDocs = [],
//     reminders = [],
//   } = req.body;

//   const tender = await prisma.$transaction(async (tx) => {
//     let category = await tx.category.findUnique({ where: { name: categoryName } });
//     if (!category) {
//       category = await tx.category.create({
//         data: { name: categoryName, createdAt: new Date() },
//       });
//       winston.info(`Created category: ${categoryName} (ID: ${category.id})`);
//     }

//     let subcategory = await tx.subcategory.findFirst({
//       where: { name: subcategoryName, categoryId: category.id },
//     });
//     if (!subcategory) {
//       subcategory = await tx.subcategory.create({
//         data: {
//           name: subcategoryName,
//           categoryId: category.id,
//           createdBy: req.user.id,
//           createdAt: new Date(),
//         },
//       });
//       winston.info(`Created subcategory: ${subcategoryName} (ID: ${subcategory.id}) for category ID ${category.id}`);
//     }

//     await tx.tenderDoc.deleteMany({ where: { tenderId: parseInt(req.params.id) } });
//     await tx.biddingDoc.deleteMany({ where: { tenderId: parseInt(req.params.id) } });
//     await tx.reminder.deleteMany({ where: { tenderId: parseInt(req.params.id) } });

//     const updatedTender = await tx.tender.update({
//       where: { id: parseInt(req.params.id) },
//       data: {
//         title,
//         description,
//         biddingOpen: new Date(biddingOpen),
//         biddingClosed: new Date(biddingClosed),
//         categoryId: category.id,
//         subcategoryId: subcategory.id,
//         postedById: req.user.id,
//         type,
//         tenderDocs: {
//           create: tenderDocs.map((doc) => ({
//             name: doc.name,
//             title: doc.title,
//             file: doc.file,
//             price: doc.price ? parseFloat(doc.price) : null,
//             type: doc.type,
//             createdAt: new Date(),
//           })),
//         },
//         biddingDocs: {
//           create: biddingDocs.map((doc) => ({
//             title: doc.title,
//             description: doc.description,
//             company: doc.company,
//             file: doc.file,
//             price: doc.price ? parseFloat(doc.price) : null,
//             type: doc.type,
//           })),
//         },
//         reminders: {
//           create: reminders.map((reminder) => ({
//             dueDate: new Date(reminder.dueDate),
//             type: reminder.type,
//             userId: req.user.id,
//           })),
//         },
//       },
//       include: {
//         category: true,
//         subcategory: true,
//         postedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
//         approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
//         tenderDocs: true,
//         biddingDocs: true,
//         reminders: true,
//       },
//     });

//     await tx.activityLog.create({
//       data: {
//         method: 'PUT',
//         role: req.user.role,
//         action: 'UPDATE_TENDER',
//         userId: req.user.id,
//         detail: `Updated tender: ${title} (ID: ${updatedTender.id})`,
//         createdAt: new Date(),
//       },
//     });

//     return updatedTender;
//   });

//   res.json({ status: 'success', data: tender, message: 'Tender updated successfully' });
// });

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
  getAllTenders
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