const express = require('express');
const winston = require('winston');
const { PrismaClient } = require('@prisma/client');
const { notificationValidation, validate } = require('../validators/notification');
const { restrictToSystemUser, allowCustomer } = require('../middleware/auth');
const { param, query } = require('express-validator');
const cors = require('cors');

const prisma = new PrismaClient();
const router = express.Router();

// Enable CORS
router.use(cors());

// Create Notification
router.post('/', restrictToSystemUser, notificationValidation, validate, async (req, res) => {
  try {
    const { userId, customerId, message, type, isRead } = req.body;

    const user = await prisma.systemUser.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      return res.status(404).json({ status: 'error', error: 'SystemUser not found' });
    }

    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
      if (!customer) {
        return res.status(404).json({ status: 'error', error: 'Customer not found' });
      }
    }

    const notification = await prisma.$transaction(async (tx) => {
      const newNotification = await tx.notification.create({
        data: {
          userId: parseInt(userId),
          customerId: customerId ? parseInt(customerId) : null,
          message,
          type,
          isRead: isRead || false,
        },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      await tx.activityLog.create({
        data: {
          method: 'POST',
          role: req.user.role,
          action: 'CREATE_NOTIFICATION',
          userId: req.user.id,
          customerId: customerId ? parseInt(customerId) : null,
          detail: `Created notification ID: ${newNotification.id} for user ID: ${userId}`,
          createdAt: new Date().toISOString(),
        },
      });

      return newNotification;
    });

    res.status(201).json({
      status: 'success',
      data: notification,
      message: 'Notification created successfully',
    });
  } catch (error) {
    winston.error(`Error creating notification: ${error.message}`, { error });
    res.status(500).json({ status: 'error', error: 'Failed to create notification' });
  }
});

// Bulk Create Notifications
router.post('/bulk', restrictToSystemUser, async (req, res) => {
  try {
    const notifications = req.body; // Expecting an array of notification objects
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ status: 'error', error: 'Expected an array of notifications' });
    }

    const createdNotifications = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const { userId, customerId, message, type, isRead } of notifications) {
        const user = await tx.systemUser.findUnique({ where: { id: parseInt(userId) } });
        if (!user) {
          throw new Error(`SystemUser not found for userId: ${userId}`);
        }

        if (customerId) {
          const customer = await tx.customer.findUnique({ where: { id: parseInt(customerId) } });
          if (!customer) {
            throw new Error(`Customer not found for customerId: ${customerId}`);
          }
        }

        const newNotification = await tx.notification.create({
          data: {
            userId: parseInt(userId),
            customerId: customerId ? parseInt(customerId) : null,
            message,
            type,
            isRead: isRead || false,
          },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        });

        await tx.activityLog.create({
          data: {
            method: 'POST',
            role: req.user.role,
            action: 'CREATE_NOTIFICATION_BULK',
            userId: req.user.id,
            customerId: customerId ? parseInt(customerId) : null,
            detail: `Created notification ID: ${newNotification.id} for user ID: ${userId}`,
            createdAt: new Date().toISOString(),
          },
        });

        results.push(newNotification);
      }
      return results;
    });

    res.status(201).json({
      status: 'success',
      data: createdNotifications,
      message: 'Notifications created successfully',
    });
  } catch (error) {
    winston.error(`Error creating bulk notifications: ${error.message}`, { error });
    res.status(500).json({ status: 'error', error: `Failed to create notifications: ${error.message}` });
  }
});

// Get All Notifications with Filtering
router.get(
  '/',
  allowCustomer,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('type').optional().isString().withMessage('Type must be a string'),
    query('isRead').optional().isBoolean().withMessage('isRead must be a boolean'),
  ],
  validate,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, type, isRead } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = req.user.role === 'CUSTOMER' ? { customerId: req.user.id } : { userId: req.user.id };

      // Add filters for type and isRead
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead === 'true';

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        ]),
        prisma.notification.count({ where }),
      ]);

      res.json({
        status: 'success',
        data: notifications,
        meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
      });
    }
    

    
    catch (error) {
      winston.error(`Error fetching notifications: ${error.message}`, { error });
      res.status(500).json({ status: 'error', error: 'Failed to fetch notifications' });
    }
  
);


// Get Single Notification
router.get(
  '/:id',
  allowCustomer,
  [param('id').isInt().withMessage('Notification ID must be an integer')],
  validate,
  async (req, res) => {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      if (!notification) {
        return res.status(404).json({ status: 'error', error: 'Notification not found' });
      }

      if (req.user.role === 'CUSTOMER' && notification.customerId !== req.user.id) {
        return res.status(403).json({ status: 'error', error: 'Unauthorized to access this notification' });
      }

      if (req.user.role !== 'CUSTOMER' && notification.userId !== req.user.id) {
        return res.status(403).json({ status: 'error', error: 'Unauthorized to access this notification' });
      }

      res.json({ status: 'success', data: notification });
    } catch (error) {
      winston.error(`Error fetching notification: ${error.message}`, { error });
      res.status(500).json({ status: 'error', error: 'Failed to fetch notification' });
    }
  }
);

// Update Notification
router.put(
  '/:id',
  restrictToSystemUser,
  notificationValidation,
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, customerId, message, type, isRead } = req.body;

      const user = await prisma.systemUser.findUnique({ where: { id: parseInt(userId) } });
      if (!user) {
        return res.status(404).json({ status: 'error', error: 'SystemUser not found' });
      }

      if (customerId) {
        const customer = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
        if (!customer) {
          return res.status(404).json({ status: 'error', error: 'Customer not found' });
        }
      }

      const notification = await prisma.$transaction(async (tx) => {
        const updatedNotification = await tx.notification.update({
          where: { id: parseInt(id) },
          data: {
            userId: parseInt(userId),
            customerId: customerId ? parseInt(customerId) : null,
            message,
            type,
            isRead,
          },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        });

        await tx.activityLog.create({
          data: {
            method: 'PUT',
            role: req.user.role,
            action: 'UPDATE_NOTIFICATION',
            userId: req.user.id,
            customerId: customerId ? parseInt(customerId) : null,
            detail: `Updated notification ID: ${updatedNotification.id}`,
            createdAt: new Date().toISOString(),
          },
        });

        return updatedNotification;
      });

      res.json({ status: 'success', data: notification, message: 'Notification updated successfully' });
    } catch (error) {
      winston.error(`Error updating notification: ${error.message}`, { error });
      if (error.code === 'P2025') {
        return res.status(404).json({ status: 'error', error: 'Notification not found' });
      }
      res.status(500).json({ status: 'error', error: 'Failed to update notification' });
    }
  }
);

// Mark Notification as Read/Unread
router.patch(
  '/:id/read',
  allowCustomer,
  [param('id').isInt().withMessage('Notification ID must be an integer')],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isRead } = req.body;

      if (typeof isRead !== 'boolean') {
        return res.status(400).json({ status: 'error', error: 'isRead must be a boolean' });
      }

      const notification = await prisma.notification.findUnique({
        where: { id: parseInt(id) },
      });

      if (!notification) {
        return res.status(404).json({ status: 'error', error: 'Notification not found' });
      }

      if (req.user.role === 'CUSTOMER' && notification.customerId !== req.user.id) {
        return res.status(403).json({ status: 'error', error: 'Unauthorized to modify this notification' });
      }

      if (req.user.role !== 'CUSTOMER' && notification.userId !== req.user.id) {
        return res.status(403).json({ status: 'error', error: 'Unauthorized to modify this notification' });
      }

      const updatedNotification = await prisma.$transaction(async (tx) => {
        const updated = await tx.notification.update({
          where: { id: parseInt(id) },
          data: { isRead },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        });

        await tx.activityLog.create({
          data: {
            method: 'PATCH',
            role: req.user.role,
            action: 'UPDATE_NOTIFICATION_READ',
            userId: req.user.id,
            customerId: notification.customerId,
            detail: `Updated notification ID: ${id} isRead to ${isRead}`,
            createdAt: new Date().toISOString(),
          },
        });

        return updated;
      });

      res.json({
        status: 'success',
        data: updatedNotification,
        message: `Notification marked as ${isRead ? 'read' : 'unread'}`,
      });
    } catch (error) {
      winston.error(`Error updating notification read status: ${error.message}`, { error });
      if (error.code === 'P2025') {
        return res.status(404).json({ status: 'error', error: 'Notification not found' });
      }
      res.status(500).json({ status: 'error', error: 'Failed to update notification read status' });
    }
  }
);

// Delete Notification
router.delete(
  '/:id',
  restrictToSystemUser,
  [param('id').isInt().withMessage('Notification ID must be an integer')],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await prisma.notification.findUnique({ where: { id: parseInt(id) } });
      if (!notification) {
        return res.status(404).json({ status: 'error', error: 'Notification not found' });
      }

      await prisma.$transaction(async (tx) => {
        await tx.notification.delete({ where: { id: parseInt(id) } });

        await tx.activityLog.create({
          data: {
            method: 'DELETE',
            role: req.user.role,
            action: 'DELETE_NOTIFICATION',
            userId: req.user.id,
            customerId: notification.customerId,
            detail: `Deleted notification ID: ${id}`,
            createdAt: new Date().toISOString(),
          },
        });
      });

      res.status(200).json({ status: 'success', message: 'Notification deleted successfully' });
    } catch (error) {
      winston.error(`Error deleting notification: ${error.message}`, { error });
      res.status(500).json({ status: 'error', error: 'Failed to delete notification' });
    }
  }
);

module.exports = router;