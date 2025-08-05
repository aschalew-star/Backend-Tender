const express = require('express');
const winston = require('winston');
const authenticate = require('../middleware/auth');
const upload = require('../utils/multerConfig');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const router = express.Router();

// Validation middleware for TenderDoc



// Create TenderDoc
router.post(
  '/:tenderId/tenderDocs',
  upload.single('file'), // Single file upload
  [
    param('tenderId').isInt().withMessage('Tender ID must be an integer'),
    ...tenderDocValidation,
  ],
  async (req, res) => {
    try {
      const { tenderId } = req.params;
      const { name, title, price, type, customerIds = [] } = req.body;

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          error: 'File is required',
        });
      }

      // Verify Tender exists
      const tender = await prisma.tender.findUnique({
        where: { id: parseInt(tenderId) },
      });
      if (!tender) {
        await fs.unlink(req.file.path).catch(err => winston.error(`Error deleting file: ${err.message}`));
        return res.status(404).json({
          status: 'error',
          error: 'Tender not found',
        });
      }

      // Verify Customers exist
      if (customerIds.length > 0) {
        const customers = await prisma.customer.findMany({
          where: { id: { in: customerIds.map(id => parseInt(id)) } },
        });
        if (customers.length !== customerIds.length) {
          await fs.unlink(req.file.path).catch(err => winston.error(`Error deleting file: ${err.message}`));
          return res.status(400).json({
            status: 'error',
            error: 'One or more customer IDs are invalid',
          });
        }
      }

      // Create TenderDoc
      const tenderDoc = await prisma.$transaction(async (tx) => {
        const doc = await tx.tenderDoc.create({
          data: {
            name,
            title,
            file: req.file.path, // Store file path
            price: price ? parseFloat(price) : null,
            type,
            tenderId: parseInt(tenderId),
            createdAt: new Date(),
            customers: {
              connect: customerIds.map(id => ({ id: parseInt(id) })),
            },
          },
          include: {
            tender: {
              select: { id: true, title: true },
            },
            customers: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        });

        // Log activity
        await tx.activityLog.create({
          data: {
            method: 'POST',
            role: req.user.role,
            action: 'CREATE_TENDERDOC',
            userId: req.user.id,
            detail: `Created tenderDoc: ${title} (ID: ${doc.id}) for tender ID: ${tenderId}`,
            createdAt: new Date(),
          },
        });

        return doc;
      });

      res.status(201).json({
        status: 'success',
        data: tenderDoc,
        message: 'TenderDoc created successfully',
      });
    } catch (error) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => winston.error(`Error deleting file: ${err.message}`));
      }
      winston.error(`Error creating tenderDoc: ${error.message}`, { error });
      if (error.code === 'P2002') {
        return res.status(400).json({
          status: 'error',
          error: 'Duplicate tenderDoc',
        });
      }
      res.status(500).json({
        status: 'error',
        error: 'Failed to create tenderDoc',
        details: error.message,
      });
    }
  }
);

// Get All TenderDocs for a Tender
router.get('/:tenderId/tenderDocs', [
  param('tenderId').isInt().withMessage('Tender ID must be an integer'),
], async (req, res) => {
  try {
    const { tenderId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tender = await prisma.tender.findUnique({
      where: { id: parseInt(tenderId) },
    });
    if (!tender) {
      return res.status(404).json({
        status: 'error',
        error: 'Tender not found',
      });
    }

    const [tenderDocs, total] = await Promise.all([
      prisma.tenderDoc.findMany({
        where: { tenderId: parseInt(tenderId) },
        skip,
        take: parseInt(limit),
        include: {
          tender: {
            select: { id: true, title: true },
          },
          customers: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenderDoc.count({ where: { tenderId: parseInt(tenderId) } }),
    ]);

    res.json({
      status: 'success',
      data: tenderDocs,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    winston.error(`Error fetching tenderDocs: ${error.message}`, { error });
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch tenderDocs',
    });
  }
});

// Get Single TenderDoc
router.get('/:tenderId/tenderDocs/:id', authenticate, [
  param('tenderId').isInt().withMessage('Tender ID must be an integer'),
  param('id').isInt().withMessage('TenderDoc ID must be an integer'),
], validate, async (req, res) => {
  try {
    const { tenderId, id } = req.params;

    const tenderDoc = await prisma.tenderDoc.findUnique({
      where: { id: parseInt(id), tenderId: parseInt(tenderId) },
      include: {
        tender: {
          select: { id: true, title: true },
        },
        customers: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!tenderDoc) {
      return res.status(404).json({
        status: 'error',
        error: 'TenderDoc not found',
      });
    }

    res.json({
      status: 'success',
      data: tenderDoc,
    });
  } catch (error) {
    winston.error(`Error fetching tenderDoc: ${error.message}`, { error });
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch tenderDoc',
    });
  }
});

// Update TenderDoc
router.put(
  '/:tenderId/tenderDocs/:id',
  upload.single('file'), // Allow updating the file
  [
    param('tenderId').isInt().withMessage('Tender ID must be an integer'),
    param('id').isInt().withMessage('TenderDoc ID must be an integer'),
    ...tenderDocValidation,
  ],
  async (req, res) => {
    try {
      const { tenderId, id } = req.params;
      const { name, title, price, type, customerIds = [] } = req.body;

      // Verify Tender exists
      const tender = await prisma.tender.findUnique({
        where: { id: parseInt(tenderId) },
      });
      if (!tender) {
        if (req.file) {
          await fs.unlink(req.file.path).catch(err => winston.error(`Error deleting file: ${err.message}`));
        }
        return res.status(404).json({
          status: 'error',
          error: 'Tender not found',
        });
      }

      // Verify TenderDoc exists
      const existingDoc = await prisma.tenderDoc.findUnique({
        where: { id: parseInt(id), tenderId: parseInt(tenderId) },
      });
      if (!existingDoc) {
        if (req.file) {
          await fs.unlink(req.file.path).catch(err => winston.error(`Error deleting file: ${err.message}`));
        }
        return res.status(404).json({
          status: 'error',
          error: 'TenderDoc not found',
        });
      }

      // Verify Customers exist
      if (customerIds.length > 0) {
        const customers = await prisma.customer.findMany({
          where: { id: { in: customerIds.map(id => parseInt(id)) } },
        });
        if (customers.length !== customerIds.length) {
          if (req.file) {
            await fs.unlink(req.file.path).catch(err => winston.error(`Error deleting file: ${err.message}`));
          }
          return res.status(400).json({
            status: 'error',
            error: 'One or more customer IDs are invalid',
          });
        }
      }

      // Update TenderDoc
      const tenderDoc = await prisma.$transaction(async (tx) => {
        // Delete old file if a new one is uploaded
        if (req.file && existingDoc.file) {
          await fs.unlink(existingDoc.file).catch(err => winston.error(`Error deleting old file: ${err.message}`));
        }

        const doc = await tx.tenderDoc.update({
          where: { id: parseInt(id) },
          data: {
            name,
            title,
            file: req.file ? req.file.path : existingDoc.file, // Keep old file if no new file
            price: price ? parseFloat(price) : null,
            type,
            createdAt: new Date(),
            customers: {
              set: customerIds.map(id => ({ id: parseInt(id) })),
            },
          },
          include: {
            tender: {
              select: { id: true, title: true },
            },
            customers: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        });

        // Log activity
        await tx.activityLog.create({
          data: {
            method: 'PUT',
            role: req.user.role,
            action: 'UPDATE_TENDERDOC',
            userId: req.user.id,
            detail: `Updated tenderDoc: ${title} (ID: ${doc.id}) for tender ID: ${tenderId}`,
            createdAt: new Date(),
          },
        });

        return doc;
      });

      res.json({
        status: 'success',
        data: tenderDoc,
        message: 'TenderDoc updated successfully',
      });
    } catch (error) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => winston.error(`Error deleting file: ${err.message}`));
      }
      winston.error(`Error updating tenderDoc: ${error.message}`, { error });
      if (error.code === 'P2025') {
        return res.status(404).json({
          status: 'error',
          error: 'TenderDoc not found',
        });
      }
      res.status(500).json({
        status: 'error',
        error: 'Failed to update tenderDoc',
      });
    }
  }
);

// Delete TenderDoc
router.delete('/:tenderId/tenderDocs/:id', authenticate, [
  param('tenderId').isInt().withMessage('Tender ID must be an integer'),
  param('id').isInt().withMessage('TenderDoc ID must be an integer'),
], validate, async (req, res) => {
  try {
    const { tenderId, id } = req.params;

    await prisma.$transaction(async (tx) => {
      const tenderDoc = await tx.tenderDoc.findUnique({
        where: { id: parseInt(id), tenderId: parseInt(tenderId) },
      });
      if (!tenderDoc) {
        throw new Error('TenderDoc not found');
      }

      // Delete file from storage
      await fs.unlink(tenderDoc.file).catch(err => winston.error(`Error deleting file: ${err.message}`));

      await tx.tenderDoc.delete({
        where: { id: parseInt(id) },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          method: 'DELETE',
          role: req.user.role,
          action: 'DELETE_TENDERDOC',
          userId: req.user.id,
          detail: `Deleted tenderDoc ID: ${id} for tender ID: ${tenderId}`,
          createdAt: new Date(),
        },
      });
    });

    res.status(204).json({
      status: 'success',
      message: 'TenderDoc deleted successfully',
    });
  } catch (error) {
    winston.error(`Error deleting tenderDoc: ${error.message}`, { error });
    if (error.message === 'TenderDoc not found') {
      return res.status(404).json({
        status: 'error',
        error: 'TenderDoc not found',
      });
    }
    res.status(500).json({
      status: 'error',
      error: 'Failed to delete tenderDoc',
    });
  }
});

// Serve TenderDoc File
router.get('/:tenderId/tenderDocs/:id/file', authenticate, [
  param('tenderId').isInt().withMessage('Tender ID must be an integer'),
  param('id').isInt().withMessage('TenderDoc ID must be an integer'),
],
    async (req, res) => {
  try {
    const { tenderId, id } = req.params;

    const tenderDoc = await prisma.tenderDoc.findUnique({
      where: { id: parseInt(id), tenderId: parseInt(tenderId) },
    });

    if (!tenderDoc) {
      return res.status(404).json({
        status: 'error',
        error: 'TenderDoc not found',
      });
    }

    const filePath = path.join(__dirname, '../..', tenderDoc.file);
    res.sendFile(filePath, (err) => {
      if (err) {
        winston.error(`Error serving file: ${err.message}`);
        res.status(404).json({
          status: 'error',
          error: 'File not found',
        });
      }
    });
  } catch (error) {
    winston.error(`Error serving tenderDoc file: ${error.message}`, { error });
    res.status(500).json({
      status: 'error',
      error: 'Failed to serve file',
    });
  }
});

module.exports = router;