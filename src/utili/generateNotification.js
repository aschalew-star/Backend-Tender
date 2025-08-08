const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const prisma = require('../config/db.js');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/notifications.log' }),
  ],
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getEmailTemplate = (firstName, title, context, notificationType, entityId = null) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: #007bff; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { padding: 20px; }
    .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
    .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${title}</h2>
    </div>
    <div class="content">
      <p>Hi ${firstName || 'User'},</p>
      <p>${context}</p>
      <p>This notification is sent based on your preference for ${notificationType.toLowerCase()} updates.</p>
      ${entityId ? `<a href="https://your-app.com/users/${entityId}" class="button">View User</a>` : ''}
    </div>
    <div class="footer">
      <p>You're receiving this because you subscribed to notifications.</p>
      <p><a href="https://your-app.com/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

async function sendNotification({ userId, customerId, tender, message, type, context, maxRetries = 3 }) {
  const recipientId = userId || customerId;
  logger.info('Attempting to send notification', { userId, customerId, tenderId: tender?.id, type });

  // Check if notification already sent for this tender and recipient (only for tender notifications)
  if (tender) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        tenderId: tender.id,
        OR: [{ userId }, { customerId }],
      },
    });

    if (existingNotification) {
      logger.info('Skipping notification: already sent for this tender and recipient', {
        userId,
        customerId,
        tenderId: tender.id,
      });
      return;
    }
  }

  let retries = 0;
  let emailStatus = 'success';
  let emailError = null;

  const user = userId
    ? await prisma.systemUser.findUnique({
        where: { id: userId },
        select: { id: true, email: true, firstName: true },
      })
    : null;
  const customer = customerId
    ? await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, email: true, firstName: true },
      })
    : null;
  const recipient = user || customer;

  if (!recipient) {
    logger.warn('No recipient found', { userId, customerId });
    return;
  }

  while (retries < maxRetries) {
    try {
      if (recipient.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: recipient.email,
          subject: tender ? `New Tender Notification: ${tender.title}` : `New User Registration`,
          html: getEmailTemplate(recipient.firstName, tender ? `New Tender Alert!` : `New User Registration`, context, type.toLowerCase(), recipient.id),
        });
        emailStatus = 'success';
        emailError = null;
        logger.info('Email sent successfully', { recipientId, email: recipient.email });
      } else {
        emailStatus = 'skipped';
        emailError = 'No email provided';
        logger.warn('No email provided for recipient', { recipientId });
      }

      break;
    } catch (error) {
      retries++;
      emailStatus = 'retry';
      emailError = error.message;
      logger.warn(`Retry ${retries}/${maxRetries} for notification`, { recipientId, error: error.message });
      if (retries === maxRetries) {
        emailStatus = 'failed';
        logger.error('Notification failed after max retries', { recipientId, error: error.message });
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }

  await prisma.notificationLog.create({
    data: {
      userId,
      customerId,
      tenderId: tender?.id,
      channel: 'email',
      status: emailStatus,
      errorMessage: emailError,
    },
  });

  if (emailStatus === 'success') {
    await prisma.notification.create({
      data: {
        userId,
        customerId,
        message,
        type: `NOTIFICATION_${type}`,
        isRead: false,
        tenderId: tender?.id,
      },
    });
    logger.info('Notification recorded in database', { userId, customerId, tenderId: tender?.id });
  }
}

async function queueNotificationsForNewTender(tender) {
  logger.info('Queuing notifications for tender', { tenderId: tender.id, title: tender.title });
  try {
    const notifiedRecipients = new Set();

    const now = new Date();
    const currentHour = now.getHours();

    const timeRanges = {
      MORNING: { start: 0, end: 11 },
      AFTERNOON: { start: 12, end: 17 },
      EVENING: { start: 18, end: 23 },
    };

    const reminders = await prisma.reminder.findMany({
      select: {
        id: true,
        type: true,
        userId: true,
        customerId: true,
        tenderId: true,
        user: { select: { id: true, email: true, firstName: true } },
        customer: { select: { id: true, email: true, firstName: true } },
        categories: { select: { categoryId: true, category: { select: { id: true, name: true } } } },
        subcategories: { select: { subcategoryId: true, subcategory: { select: { id: true, name: true } } } },
        regions: { select: { regionId: true, region: { select: { id: true, name: true } } } },
      },
    });

    logger.info('Fetched reminders', { count: reminders.length });

    for (const reminder of reminders) {
      const recipientId = reminder.userId || reminder.customerId;
      if (notifiedRecipients.has(recipientId)) {
        logger.debug('Skipping duplicate recipient', { recipientId, tenderId: tender.id });
        continue;
      }

      const reminderType = reminder.type;
      let shouldNotifyNow = false;
      let notifyAt = new Date(now);

      // Check if reminder is missing all of categories, subcategories, and regions
      const missingAllFields = 
        reminder.categories.length === 0 &&
        reminder.subcategories.length === 0 &&
        reminder.regions.length === 0;

      // Original matching condition
      const originalMatch =
        reminder.categories.some(c => c.categoryId === tender.categoryId) ||
        reminder.subcategories.some(s => s.subcategoryId === tender.subcategoryId) ||
        (tender.regionId && reminder.regions.some(r => r.regionId === tender.regionId));

      // Send notification if either the original condition is met OR all fields are missing
      const isMatch = originalMatch || missingAllFields;

      if (!isMatch) {
        logger.debug('Reminder does not match tender and has some fields', {
          reminderId: reminder.id,
          tenderId: tender.id,
          categoryId: tender.categoryId,
          subcategoryId: tender.subcategoryId,
          regionId: tender.regionId,
          missingAllFields,
        });
        continue;
      }

      const contextParts = [`tender "${tender.title}"`];
      const matchedCategory = reminder.categories.find(c => c.categoryId === tender.categoryId);
      const matchedSubcategory = reminder.subcategories.find(s => s.subcategoryId === tender.subcategoryId);
      const matchedRegion = tender.regionId && reminder.regions.find(r => r.regionId === tender.regionId);
      if (matchedCategory) contextParts.push(`category "${matchedCategory.category.name}"`);
      if (matchedSubcategory) contextParts.push(`subcategory "${matchedSubcategory.subcategory.name}"`);
      if (matchedRegion) contextParts.push(`region "${matchedRegion.region.name}"`);
      if (missingAllFields) contextParts.push(`no specific filters set`);

      const context = contextParts.join(", ");
      const message = `New tender available: ${context} (notified based on your preference for ${reminderType.toLowerCase()}).`;

      if (['MORNING', 'AFTERNOON', 'EVENING'].includes(reminderType)) {
        const { start, end } = timeRanges[reminderType];
        if (currentHour >= start && currentHour <= end) {
          shouldNotifyNow = true;
        } else {
          if (reminderType === 'AFTERNOON') {
            notifyAt = new Date(now.setHours(12, 0, 0, 0));
            if (currentHour >= 12) notifyAt.setDate(notifyAt.getDate() + 1);
          } else if (reminderType === 'EVENING') {
            notifyAt = new Date(now.setHours(18, 0, 0, 0));
            if (currentHour >= 18) notifyAt.setDate(notifyAt.getDate() + 1);
          } else if (reminderType === 'MORNING') {
            notifyAt = new Date(now.setHours(0, 0, 0, 0));
            notifyAt.setDate(notifyAt.getDate() + 1);
          }
        }
      } else {
        shouldNotifyNow = true;
      }

      if (shouldNotifyNow) {
        await sendNotification({
          userId: reminder.userId,
          customerId: reminder.customerId,
          tender,
          message,
          type: reminderType,
          context,
        });
        notifiedRecipients.add(recipientId);
      } else {
        // Check if pending notification already exists
        const existingPending = await prisma.pendingNotification.findFirst({
          where: {
            tenderId: tender.id,
            OR: [{ userId: reminder.userId }, { customerId: reminder.customerId }],
          },
        });

        if (existingPending) {
          logger.info('Skipping duplicate pending notification', {
            userId: reminder.userId,
            customerId: reminder.customerId,
            tenderId: tender.id,
          });
          continue;
        }

        await prisma.pendingNotification.create({
          data: {
            userId: reminder.userId,
            customerId: reminder.customerId,
            tenderId: tender.id,
            message,
            type: `NOTIFICATION_${reminderType}`,
            notifyAt,
          },
        });
        logger.info('Queued pending notification', { userId: reminder.userId, customerId: reminder.customerId, tenderId: tender.id });
        notifiedRecipients.add(recipientId);
      }
    }

    logger.info(`Completed queuing notifications for tender`, { tenderId: tender.id, notifiedCount: notifiedRecipients.size });
  } catch (error) {
    logger.error('Error queuing notifications for new tender:', { error: error.message, stack: error.stack });
  }
}

async function processPendingNotifications() {
  logger.info('Processing pending notifications');
  try {
    const now = new Date();
    const pendingNotifications = await prisma.reminder.findMany({
      where: {
        notifyAt: { lte: now },
      },
      include: {
        tender: { select: { id: true, title: true, categoryId: true, subcategoryId: true, regionId: true } },
        user: { select: { id: true, email: true, firstName: true } },
        customer: { select: { id: true, email: true, firstName: true } },
      },
    });

    logger.info('Fetched pending notifications', { count: pendingNotifications.length });

    const notifiedRecipients = new Set();

    for (const pending of pendingNotifications) {
      const recipientId = pending.userId || pending.customerId;
      if (notifiedRecipients.has(recipientId)) {
        logger.debug('Skipping duplicate pending notification', { pendingId: pending.id, recipientId });
        await prisma.pendingNotification.delete({ where: { id: pending.id } });
        continue;
      }

      // Check if notification already sent
      const existingNotification = await prisma.notification.findFirst({
        where: {
          tenderId: pending.tenderId,
          OR: [{ userId: pending.userId }, { customerId: pending.customerId }],
        },
      });

      if (existingNotification) {
        logger.info('Skipping pending notification: already sent', {
          pendingId: pending.id,
          recipientId,
          tenderId: pending.tenderId,
        });
        await prisma.pendingNotification.delete({ where: { id: pending.id } });
        continue;
      }

      const context = pending.message.split(': ')[1].split(' (')[0];
      const type = pending.type.split('_').pop();
      await sendNotification({
        userId: pending.userId,
        customerId: pending.customerId,
        tender: pending.tender,
        message: pending.message,
        type,
        context,
      });
      await prisma.notificationLog.updateMany({
        where: { pendingNotificationId: pending.id },
        data: { pendingNotificationId: null },
      });
      await prisma.pendingNotification.delete({ where: { id: pending.id } });
      notifiedRecipients.add(recipientId);
      logger.info('Processed pending notification', { pendingId: pending.id, recipientId });
    }

    logger.info(`Processed ${pendingNotifications.length} pending notifications, notified ${notifiedRecipients.size} recipients`);
  } catch (error) {
    logger.error('Error processing pending notifications:', { error: error.message, stack: error.stack });
  }
}

async function sendRegistrationNotification({ userId, customerId, userType }) {
  logger.info('Processing registration notification', { userId, customerId, userType });
  try {
    if (customerId) {
      // Customer registration: notify only the customer
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, email: true, firstName: true },
      });

      if (!customer) {
        logger.warn('Customer not found for registration notification', { customerId });
        return;
      }

      const context = `Welcome! Your account has been successfully registered as a customer.`;
      const message = `New customer registration: ${customer.firstName || 'Customer'} has registered.`;

      await sendNotification({
        customerId: customer.id,
        message,
        type: 'REGISTRATION',
        context,
      });
      logger.info('Customer registration notification sent', { customerId });
    } else if (userId) {
      // System user registration: notify the system user and all admin system users
      const systemUser = await prisma.systemUser.findUnique({
        where: { id: userId },
        select: { id: true, email: true, firstName: true, role: true },
      });

      if (!systemUser) {
        logger.warn('System user not found for registration notification', { userId });
        return;
      }

      // Notify the registered system user
      const userContext = `Welcome! Your account has been successfully registered as a system user.`;
      const userMessage = `New system user registration: ${systemUser.firstName || 'User'} has registered.`;
      await sendNotification({
        userId: systemUser.id,
        message: userMessage,
        type: 'REGISTRATION',
        context: userContext,
      });
      logger.info('System user registration notification sent to user', { userId });

      // Notify all admin system users
      const admins = await prisma.systemUser.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, firstName: true },
      });

      for (const admin of admins) {
        const adminContext = `A new system user, ${systemUser.firstName || 'User'}, has registered.`;
        const adminMessage = `New system user registration: ${systemUser.firstName || 'User'} has registered.`;
        await sendNotification({
          userId: admin.id,
          message: adminMessage,
          type: 'REGISTRATION',
          context: adminContext,
        });
        logger.info('System user registration notification sent to admin', { adminId: admin.id, userId });
      }
    } else {
      logger.warn('No valid userId or customerId provided for registration notification');
    }
  } catch (error) {
    logger.error('Error sending registration notification:', { error: error.message, stack: error.stack });
  }
}

cron.schedule('*/10 * * * *', async () => {
  logger.info('Cron job running for pending notifications', { time: new Date().toISOString() });
  await processPendingNotifications();
});

module.exports = { sendNotification, queueNotificationsForNewTender, processPendingNotifications, sendRegistrationNotification };