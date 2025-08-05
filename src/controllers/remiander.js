const express = require('express');
const winston = require('winston');
const { PrismaClient } = require('@prisma/client');
const { reminderValidation, validate } = require('../validators/reminder');
const { restrictToSystemUser, allowCustomer } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Create Reminder
router.post('/', restrictToSystemUser, reminderValidation, validate, async (req, res) => {
  try {
    const { customerId, tenderId, message, dueDate } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
    if (!customer) {
      return res.status(404).json({ status: 'error', error: 'Customer not found' });
    }

    const tender = await prisma.tender.findUnique({ where: { id: parseInt(tenderId) } });
    if (!tender) {
      return res.status(404).json({ status: 'error', error: 'Tender not found' });
    }

    const reminder = await prisma.$transaction(async (tx) => {
      const newReminder = await tx.reminder.create({
        data: {
          customerId: parseInt(customerId),
          tenderId: parseInt(tenderId),
          message,
          dueDate: new Date(dueDate),
          createdBy: req.user.id,
          createdAt: new Date(),
        },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          tender: { select: { id: true, title: true } },
          createdByUser: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      await tx.activityLog.create({
        data: {
          method: 'POST',
          role: req.user.role,
          action: 'CREATE_REMINDER',
          userId: req.user.id,
          customerId: parseInt(customerId),
          detail: `Created reminder ID: ${newReminder.id} for customer ID: ${customerId}, tender ID: ${tenderId}`,
          createdAt: new Date(),
        },
      });

      return newReminder;
    });

    res.status(201).json({
      status: 'success',
      data: reminder,
      message: 'Reminder created successfully',
    });
  } catch (error) {
    winston.error(`Error creating reminder: ${error.message}`, { error });
    res.status(500).json({ status: 'error', error: 'Failed to create reminder' });
  }
});

// Get All Reminders
router.get('/', allowCustomer, async (req, res) => {
  try {
    const { page = 1, limit = 10, customerId, tenderId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (req.user.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    } else if (customerId) {
      where.customerId = parseInt(customerId);
    }
    if (tenderId) {
      where.tenderId = parseInt(tenderId);
    }

    const [reminders, total] = await Promise.all([
      prisma.reminder.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          tender: { select: { id: true, title: true } },
          createdByUser: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reminder.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: reminders,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    winston.error(`Error fetching reminders: ${error.message}`, { error });
    res.status(500).json({ status: 'error', error: 'Failed to fetch reminders' });
  }
});

// Get Single Reminder
router.get('/:id', allowCustomer, [
  param('id').isInt().withMessage('Reminder ID must be an integer'),
], validate, async (req, res) => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        tender: { select: { id: true, title: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!reminder) {
      return res.status(404).json({ status: 'error', error: 'Reminder not found' });
    }

    if (req.user.role === 'CUSTOMER' && reminder.customerId !== req.user.id) {
      return res.status(403).json({ status: 'error', error: 'Unauthorized to access this reminder' });
    }

    res.json({ status: 'success', data: reminder });
  } catch (error) {
    winston.error(`Error fetching reminder: ${error.message}`, { error });
    res.status(500).json({ status: 'error', error: 'Failed to fetch reminder' });
  }
});

// Update Reminder
router.put('/:id', restrictToSystemUser, reminderValidation, validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, tenderId, message, dueDate } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
    if (!customer) {
      return res.status(404).json({ status: 'error', error: 'Customer not found' });
    }

    const tender = await prisma.tender.findUnique({ where: { id: parseInt(tenderId) } });
    if (!tender) {
      return res.status(404).json({ status: 'error', error: 'Tender not found' });
    }

    const reminder = await prisma.$transaction(async (tx) => {
      const updatedReminder = await tx.reminder.update({
        where: { id: parseInt(id) },
        data: {
          customerId: parseInt(customerId),
          tenderId: parseInt(tenderId),
          message,
          dueDate: new Date(dueDate),
          createdAt: new Date(),
        },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          tender: { select: { id: true, title: true } },
          createdByUser: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      await tx.activityLog.create({
        data: {
          method: 'PUT',
          role: req.user.role,
          action: 'UPDATE_REMINDER',
          userId: req.user.id,
          customerId: parseInt(customerId),
          detail: `Updated reminder ID: ${updatedReminder.id} for customer ID: ${customerId}`,
          createdAt: new Date(),
        },
      });

      return updatedReminder;
    });

    res.json({ status: 'success', data: reminder, message: 'Reminder updated successfully' });
  } catch (error) {
    winston.error(`Error updating reminder: ${error.message}`, { error });
    if (error.code === 'P2025') {
      return res.status(404).json({ status: 'error', error: 'Reminder not found' });
    }
    res.status(500).json({ status: 'error', error: 'Failed to update reminder' });
  }
});

// Delete Reminder
router.delete('/:id', restrictToSystemUser, [
  param('id').isInt().withMessage('Reminder ID must be an integer'),
], validate, async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      const reminder = await tx.reminder.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!reminder) {
        throw new Error('Reminder not found');
      }

      await tx.reminder.delete({ where: { id: parseInt(req.params.id) } });

      await tx.activityLog.create({
        data: {
          method: 'DELETE',
          role: req.user.role,
          action: 'DELETE_REMINDER',
          userId: req.user.id,
          customerId: reminder.customerId,
          detail: `Deleted reminder ID: ${req.params.id}`,
          createdAt: new Date(),
        },
      });
    });

    res.status(204).json({ status: 'success', message: 'Reminder deleted successfully' });
  } catch (error) {
    winston.error(`Error deleting reminder: ${error.message}`, { error });
    if (error.message === 'Reminder not found') {
      return res.status(404).json({ status: 'error', error: 'Reminder not found' });
    }
    res.status(500).json({ status: 'error', error: 'Failed to delete reminder' });
  }
});

module.exports = router;