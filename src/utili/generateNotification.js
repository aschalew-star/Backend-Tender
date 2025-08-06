const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const WebSocket = require('ws');
const prisma = new PrismaClient().$extends({
  query: {
    tender: {
      async create({ args, query }) {
        // Execute the create query
        const newTender = await query(args);
        // Trigger notifications
        await queueNotificationsForNewTender(newTender);
        return newTender;
      },
    },
  },
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configure WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map(); // Map userId/customerId to WebSocket

wss.on('connection', (ws, req) => {
  const userId = req.url.split('userId=')[1];
  if (userId) {
    clients.set(parseInt(userId), ws);
    ws.on('close', () => clients.delete(parseInt(userId)));
    ws.on('error', (error) => console.error(`WebSocket error for user ${userId}:`, error));
  }
});

// Creative HTML email template
const getEmailTemplate = (firstName, tenderTitle, context, reminderType, tenderId) => `
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
      <h2>New Tender Alert!</h2>
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>We found a new tender that matches your interests: <strong>${tenderTitle}</strong>.</p>
      <p>Details: ${context}</p>
      <p>This notification is sent based on your preference for ${reminderType.toLowerCase()} updates.</p>
      <a href="https://your-app.com/tenders/${tenderId}" class="button">View Tender</a>
    </div>
    <div class="footer">
      <p>You're receiving this because you subscribed to tender notifications.</p>
      <p><a href="https://your-app.com/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

// Send notification with retry logic
async function sendNotification({ userId, customerId, tender, message, type, context, maxRetries = 3 }) {
  let retries = 0;
  let emailStatus = 'success';
  let wsStatus = 'success';
  let emailError = null;
  let wsError = null;

  const user = userId ? await prisma.systemUser.findUnique({ where: { id: userId } }) : null;
  const customer = customerId ? await prisma.customer.findUnique({ where: { id: customerId } }) : null;
  const recipient = user || customer;
  const recipientId = userId || customerId;

  while (retries < maxRetries) {
    try {
      // Send email
      if (recipient && recipient.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: recipient.email,
          subject: `New Tender Notification: ${tender.title}`,
          html: getEmailTemplate(recipient.firstName, tender.title, context, type.toLowerCase(), tender.id),
        });
        emailStatus = 'success';
        emailError = null;
      }

      // Send WebSocket
      const ws = clients.get(recipientId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: `TENDER_NOTIFICATION_${type}`,
          tenderId: tender.id,
          title: tender.title,
          context,
          timestamp: new Date().toISOString(),
        }));
        wsStatus = 'success';
        wsError = null;
      } else {
        wsStatus = 'failed';
        wsError = 'WebSocket client not connected';
      }

      break; // Success, exit retry loop
    } catch (error) {
      retries++;
      emailStatus = 'retry';
      wsStatus = 'retry';
      emailError = error.message;
      wsError = error.message;
      if (retries === maxRetries) {
        emailStatus = 'failed';
        wsStatus = 'failed';
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
    }
  }

  // Log notification attempts
  if (recipient) {
    await prisma.notificationLog.create({
      data: {
        userId,
        customerId,
        tenderId: tender.id,
        channel: 'email',
        status: emailStatus,
        errorMessage: emailError,
      },
    });
    await prisma.notificationLog.create({
      data: {
        userId,
        customerId,
        tenderId: tender.id,
        channel: 'websocket',
        status: wsStatus,
        errorMessage: wsError,
      },
    });
  }

  // Save to Notification table
  if (emailStatus === 'success' || wsStatus === 'success') {
    await prisma.notification.create({
      data: {
        userId,
        customerId,
        message,
        type: `TENDER_NOTIFICATION_${type}`,
        isRead: false,
      },
    });
  }
}

// Process notifications for new tender
async function queueNotificationsForNewTender(tender) {
  try {
    // Get current date and time in EAT (UTC+3)
    const now = new Date();
    const currentHour = now.getHours();

    // Define time ranges for morning, afternoon, evening
    const timeRanges = {
      MORNING: { start: 0, end: 11 },
      AFTERNOON: { start: 12, end: 17 },
      EVENING: { start: 18, end: 23 },
    };

    // Fetch reminders with their associated categories, subcategories, and regions
    const reminders = await prisma.reminder.findMany({
      include: {
        user: true,
        customer: true,
        tender: true,
        categories: { include: { category: true } },
        subcategories: { include: { subcategory: true } },
        regions: { include: { region: true } },
      },
    });

    // Process reminders
    for (const reminder of reminders) {
      const reminderType = reminder.type;
      let shouldNotifyNow = false;
      let notifyAt = new Date(now);

      // Check if the tender matches any of the reminder's categories, subcategories, or regions
      const isMatch =
        (reminder.tenderId && reminder.tenderId === tender.id) ||
        reminder.categories.some(c => c.categoryId === tender.categoryId) ||
        reminder.subcategories.some(s => s.subcategoryId === tender.subcategoryId) ||
        reminder.regions.some(r => r.regionId === tender.regionId);

      if (!isMatch) continue;

      // Build context-specific message
      const contextParts = [`tender "${tender.title}"`];
      const matchedCategory = reminder.categories.find(c => c.categoryId === tender.categoryId);
      const matchedSubcategory = reminder.subcategories.find(s => s.subcategoryId === tender.subcategoryId);
      const matchedRegion = reminder.regions.find(r => r.regionId === tender.regionId);
      if (matchedCategory) contextParts.push(`category "${matchedCategory.category.name}"`);
      if (matchedSubcategory) contextParts.push(`subcategory "${matchedSubcategory.subcategory.name}"`);
      if (matchedRegion) contextParts.push(`region "${matchedRegion.region.name}"`);

      const context = contextParts.join(", ");
      const message = `New tender available: ${context} (notified based on your preference for ${reminderType.toLowerCase()}).`;

      // Determine notification timing
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
      } else {
        // Queue notification
        await prisma.pendingNotification.create({
          data: {
            userId: reminder.userId,
            customerId: reminder.customerId,
            tenderId: tender.id,
            message,
            type: `TENDER_NOTIFICATION_${reminderType}`,
            notifyAt,
          },
        });
      }
    }

    // Process users without reminders
    const systemUsers = await prisma.systemUser.findMany({
      include: { tendersPosted: true },
    });
    const customers = await prisma.customer.findMany({
      include: { biddingDocs: true, tenderDocs: true },
    });

    for (const user of systemUsers) {
      const userPreferredType = user.notificationPreference || 'DAILY';
      let shouldNotifyNow = false;
      let notifyAt = new Date(now);

      const isMatch =
        user.tendersPosted.some(
          t =>
            (tender.categoryId && t.categoryId === tender.categoryId) ||
            (tender.subcategoryId && t.subcategoryId === tender.subcategoryId) ||
            (tender.regionId && t.regionId === tender.regionId)
        );

      if (!isMatch) continue;

      const contextParts = [`tender "${tender.title}"`];
      const category = await prisma.category.findUnique({ where: { id: tender.categoryId } });
      const subcategory = await prisma.subcategory.findUnique({ where: { id: tender.subcategoryId } });
      const region = await prisma.region.findUnique({ where: { id: tender.regionId } });
      if (category) contextParts.push(`category "${category.name}"`);
      if (subcategory) contextParts.push(`subcategory "${subcategory.name}"`);
      if (region) contextParts.push(`region "${region.name}"`);

      const context = contextParts.join(", ");
      const message = `New tender available: ${context} (notified based on your preference for ${userPreferredType.toLowerCase()}).`;

      if (['MORNING', 'AFTERNOON', 'EVENING'].includes(userPreferredType)) {
        const { start, end } = timeRanges[userPreferredType];
        if (currentHour >= start && currentHour <= end) {
          shouldNotifyNow = true;
        } else {
          if (userPreferredType === 'AFTERNOON') {
            notifyAt = new Date(now.setHours(12, 0, 0, 0));
            if (currentHour >= 12) notifyAt.setDate(notifyAt.getDate() + 1);
          } else if (userPreferredType === 'EVENING') {
            notifyAt = new Date(now.setHours(18, 0, 0, 0));
            if (currentHour >= 18) notifyAt.setDate(notifyAt.getDate() + 1);
          } else if (userPreferredType === 'MORNING') {
            notifyAt = new Date(now.setHours(0, 0, 0, 0));
            notifyAt.setDate(notifyAt.getDate() + 1);
          }
        }
      } else {
        shouldNotifyNow = true;
      }

      if (shouldNotifyNow) {
        await sendNotification({
          userId: user.id,
          tender,
          message,
          type: userPreferredType,
          context,
        });
      } else if (user.email) {
        await prisma.pendingNotification.create({
          data: {
            userId: user.id,
            tenderId: tender.id,
            message,
            type: `TENDER_NOTIFICATION_${userPreferredType}`,
            notifyAt,
          },
        });
      }
    }

    for (const customer of customers) {
      const customerPreferredType = customer.notificationPreference || 'DAILY';
      let shouldNotifyNow = false;
      let notifyAt = new Date(now);

      const tenderIds = [
        ...customer.biddingDocs.map(doc => doc.tenderId),
        ...customer.tenderDocs.map(doc => doc.tenderId),
      ];
      const isMatch =
        tenderIds.includes(tender.id) ||
        (await prisma.tender.findFirst({
          where: {
            OR: [
              { categoryId: tender.categoryId },
              { subcategoryId: tender.subcategoryId },
              { regionId: tender.regionId },
            ].filter(condition => Object.values(condition).every(val => val !== null)),
          },
        }));

      if (!isMatch) continue;

      const contextParts = [`tender "${tender.title}"`];
      const category = await prisma.category.findUnique({ where: { id: tender.categoryId } });
      const subcategory = await prisma.subcategory.findUnique({ where: { id: tender.subcategoryId } });
      const region = await prisma.region.findUnique({ where: { id: tender.regionId } });
      if (category) contextParts.push(`category "${category.name}"`);
      if (subcategory) contextParts.push(`subcategory "${subcategory.name}"`);
      if (region) contextParts.push(`region "${region.name}"`);

      const context = contextParts.join(", ");
      const message = `New tender available: ${context} (notified based on your preference for ${customerPreferredType.toLowerCase()}).`;

      if (['MORNING', 'AFTERNOON', 'EVENING'].includes(customerPreferredType)) {
        const { start, end } = timeRanges[customerPreferredType];
        if (currentHour >= start && currentHour <= end) {
          shouldNotifyNow = true;
        } else {
          if (customerPreferredType === 'AFTERNOON') {
            notifyAt = new Date(now.setHours(12, 0, 0, 0));
            if (currentHour >= 12) notifyAt.setDate(notifyAt.getDate() + 1);
          } else if (customerPreferredType === 'EVENING') {
            notifyAt = new Date(now.setHours(18, 0, 0, 0));
            if (currentHour >= 18) notifyAt.setDate(notifyAt.getDate() + 1);
          } else if (customerPreferredType === 'MORNING') {
            notifyAt = new Date(now.setHours(0, 0, 0, 0));
            notifyAt.setDate(notifyAt.getDate() + 1);
          }
        }
      } else {
        shouldNotifyNow = true;
      }

      if (shouldNotifyNow) {
        await sendNotification({
          customerId: customer.id,
          tender,
          message,
          type: customerPreferredType,
          context,
        });
      } else if (customer.email) {
        await prisma.pendingNotification.create({
          data: {
            customerId: customer.id,
            tenderId: tender.id,
            message,
            type: `TENDER_NOTIFICATION_${customerPreferredType}`,
            notifyAt,
          },
        });
      }
    }

    console.log(`Queued notifications for new tender: ${tender.title}`);
  } catch (error) {
    console.error('Error queuing notifications for new tender:', error);
  }
}

// Process pending notifications
async function processPendingNotifications() {
  try {
    const now = new Date();
    const pendingNotifications = await prisma.pendingNotification.findMany({
      where: {
        notifyAt: { lte: now },
      },
      include: { tender: true, user: true, customer: true },
    });

    for (const pending of pendingNotifications) {
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
    }

    console.log(`Processed ${pendingNotifications.length} pending notifications`);
  } catch (error) {
    console.error('Error processing pending notifications:', error);
  }
}

// Schedule to process pending notifications every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  await processPendingNotifications();
});

// Example: Simulate tender creation (for testing)
async function simulateTenderCreation() {
  const newTender = await prisma.tender.create({
    data: {
      title: 'Test Tender',
      description: 'A test tender',
      biddingOpen: new Date(),
      biddingClosed: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      categoryId: 1,
      subcategoryId: 2,
      regionId: 3,
      postedById: 100,
      type: 'FREE',
    },
  });
  // No need to call queueNotificationsForNewTender; handled by extension
}

// Run simulation (remove in production)
simulateTenderCreation().finally(() => prisma.$disconnect());