const prisma = require("../config/db.js");
const handleError = require("../utili/errorhandle.js");
const asynerror = require("../utili/asyncerror.js");
const winston = require("winston");

const getNotifications = asynerror(async (req, res, next) => {
  const { page = '1', limit = '10', searchTerm = '', filterType = 'all', filterRead = 'all' } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const where = {};
  if (filterType !== 'all') {
    where.type = filterType;
  }
  if (filterRead !== 'all') {
    if (filterRead === 'read') {
      where.isRead = true;
    } else if (filterRead === 'unread') {
      where.isRead = false;
    }
  }
  if (searchTerm) {
    where.OR = [
      { message: { contains: searchTerm, mode: 'insensitive' } },
      { title: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }

  try {
    const [totalCount, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdat: 'desc' },
      }),
    ]);

    const [total, read, unread, system] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: true } }),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.count({ where: { type: 'system' } }),
    ]);

    res.status(200).json({
      status: "success",
      data: notifications,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      stats: {
        total,
        read,
        unread,
        system,
      },
    });
  } catch (error) {
    winston.error(`Error fetching notifications: ${error.message}`, { error });
    return next(new handleError("Failed to fetch notifications", 500));
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
const markNotificationRead = asynerror(async (req, res, next) => {
  const notificationId = parseInt(req.params.id);
  const { isRead } = req.body;
  
  if (isNaN(notificationId)) {
    return next(new handleError("Invalid notification ID", 400));
  }

  try {
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead:!isRead },
    });
    res.status(200).json({
      status: "success",
      data: updatedNotification,
      message: "Notification marked as read",
    });
  } catch (error) {
    winston.error(`Error marking notification as read: ${error.message}`, { error });
    return next(new handleError("Failed to update notification", 500));
  }
});

/**
 * PUT /api/notifications/mark-all-read
 * Mark all unread notifications as read
 */
const markAllNotificationsRead = asynerror(async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    res.status(200).json({
      status: "success",
      message: "All unread notifications marked as read",
    });
  } catch (error) {
    winston.error(`Error marking all notifications as read: ${error.message}`, { error });
    return next(new handleError("Failed to update notifications", 500));
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
const deleteNotification = asynerror(async (req, res, next) => {
  const notificationId = parseInt(req.params.id);
  if (isNaN(notificationId)) {
    return next(new handleError("Invalid notification ID", 400));
  }

  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });
    res.status(200).json({
      status: "success",
      message: "Notification deleted successfully",
    });
  } catch (error) {
    winston.error(`Error deleting notification: ${error.message}`, { error });
    return next(new handleError("Failed to delete notification", 500));
  }
});

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};
