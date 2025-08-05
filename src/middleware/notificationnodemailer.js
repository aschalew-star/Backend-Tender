const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');
const winston = require('winston');
const Bottleneck = require('bottleneck');

const prisma = new PrismaClient();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'notifications.log' }),
    new winston.transports.Console()
  ]
});

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your_smtp_username@example.com',
    pass: process.env.SMTP_PASS || 'your_smtp_password'
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2"
  }
});

// Rate limiter to prevent SMTP server overload
const limiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 1000 // 1 second between emails
});

// Function to send email with retry logic
async function sendEmailWithRetry(mailOptions, retries = 3, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await limiter.schedule(() => transporter.sendMail(mailOptions));
      logger.info(`Email sent: ${info.messageId} to ${mailOptions.to}`);
      return info;
    } catch (error) {
      logger.warn(`Attempt ${attempt} failed for ${mailOptions.to}: ${error.message}`);
      if (attempt === retries) {
        logger.error(`Failed to send email to ${mailOptions.to} after ${retries} attempts: ${error.message}`);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Function to send user registration confirmation email
async function sendRegistrationNotification(user) {
  const mailOptions = {
    from: '"Tender Management" <your_smtp_username@example.com>',
    to: user.email,
    subject: 'Welcome to Tender Management Platform',
    text: `Dear ${user.name || 'User'},

Thank you for registering with our Tender Management Platform!

Your account details:
- Email: ${user.email}
- Role: ${user.role || 'Not specified'}

Please verify your email address to activate your account. You can set up reminders for tenders matching your preferences.

Best regards,
Tender Management Team`,
    html: `
      <h2>Welcome to Tender Management Platform</h2>
      <p>Dear ${user.name || 'User'},</p>
      <p>Thank you for registering with our platform!</p>
      <p><strong>Your account details:</strong></p>
      <ul>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Role:</strong> ${user.role || 'Not specified'}</li>
      </ul>
      <p>Please verify your email address to activate your account. You can set up reminders for tenders matching your preferences.</p>
      <p>Best regards,<br>Tender Management Team</p>
    `
  };

  return sendEmailWithRetry(mailOptions);
}

// Function to send reminder preference update notification
async function sendReminderUpdateNotification(user, reminder) {
  const [category, subcategory, region] = await Promise.all([
    reminder.categoryId ? prisma.category.findUnique({ where: { id: reminder.categoryId } }) : null,
    reminder.subcategoryId ? prisma.subcategory.findUnique({ where: { id: reminder.subcategoryId } }) : null,
    reminder.regionId ? prisma.region.findUnique({ where: { id: reminder.regionId } }) : null
  ]);

  const mailOptions = {
    from: '"Tender Management" <your_smtp_username@example.com>',
    to: user.email,
    subject: 'Your Reminder Preferences Have Been Updated',
    text: `Dear ${user.name || 'User'},

Your reminder preferences have been updated successfully:

- Notification Type: ${reminder.type}
- Due Date: ${new Date(reminder.dueDate).toLocaleDateString()}
- Category: ${category?.name || 'Not specified'}
- Subcategory: ${subcategory?.name || 'Not specified'}
- Region: ${region?.name || 'Not specified'}

You will receive notifications for tenders matching these preferences ${reminder.dueDate ? `around ${new Date(reminder.dueDate).toLocaleDateString()}` : ''}.

Best regards,
Tender Management Team`,
    html: `
      <h2>Your Reminder Preferences Updated</h2>
      <p>Dear ${user.name || 'User'},</p>
      <p>Your reminder preferences have been updated successfully:</p>
      <ul>
        <li><strong>Notification Type:</strong> ${reminder.type}</li>
        <li><strong>Due Date:</strong> ${new Date(reminder.dueDate).toLocaleDateString()}</li>
        <li><strong>Category:</strong> ${category?.name || 'Not specified'}</li>
        <li><strong>Subcategory:</strong> ${subcategory?.name || 'Not specified'}</li>
        <li><strong>Region:</strong> ${region?.name || 'Not specified'}</li>
      </ul>
      <p>You will receive notifications for tenders matching these preferences ${reminder.dueDate ? `around ${new Date(reminder.dueDate).toLocaleDateString()}` : ''}.</p>
      <p>Best regards,<br>Tender Management Team</p>
    `
  };

  return sendEmailWithRetry(mailOptions);
}

// Function to send tender creation notification based on reminders
async function sendTenderCreationNotification(tender) {
  const reminders = await prisma.reminder.findMany({
    where: {
      OR: [
        { categoryId: tender.categoryId },
        { subcategoryId: tender.subcategoryId },
        { regionId: tender.regionId },
        { tenderId: tender.id }
      ],
      dueDate: { gte: new Date() } // Only active reminders
    },
    include: {
      user: true,
      customer: true,
      category: true,
      subcategory: true,
      region: true
    }
  });

  for (const reminder of reminders) {
    const recipient = reminder.user || reminder.customer;
    if (!recipient || !recipient.email) continue;

    const daysUntilDue = Math.ceil((reminder.dueDate - new Date()) / (1000 * 60 * 60 * 24));
    const mailOptions = {
      from: '"Tender Management" <your_smtp_username@example.com>',
      to: recipient.email,
      subject: `New Tender Available: ${tender.title}`,
      text: `Dear ${recipient.name || 'User'},

A new tender matching your reminder preferences has been created:

- Title: ${tender.title}
- Description: ${tender.description}
- Category: ${reminder.category?.name || 'Not specified'}
- Subcategory: ${reminder.subcategory?.name || 'Not specified'}
- Region: ${reminder.region?.name || 'Not specified'}
- Deadline: ${new Date(tender.deadline).toLocaleDateString()}
- Reminder Due Date: ${new Date(reminder.dueDate).toLocaleDateString()}
- Reference Number: ${tender.referenceNumber || 'Not specified'}

Please review the tender details and submit your bid by the deadline.

Best regards,
Tender Management Team`,
      html: `
        <h2>New Tender Available</h2>
        <p>Dear ${recipient.name || 'User'},</p>
        <p>A new tender matching your reminder preferences has been created:</p>
        <ul>
          <li><strong>Title:</strong> ${tender.title}</li>
          <li><strong>Description:</strong> ${tender.description}</li>
          <li><strong>Category:</strong> ${reminder.category?.name || 'Not specified'}</li>
          <li><strong>Subcategory:</strong> ${reminder.subcategory?.name || 'Not specified'}</li>
          <li><strong>Region:</strong> ${reminder.region?.name || 'Not specified'}</li>
          <li><strong>Deadline:</strong> ${new Date(tender.deadline).toLocaleDateString()}</li>
          <li><strong>Reminder Due Date:</strong> ${new Date(reminder.dueDate).toLocaleDateString()}</li>
          <li><strong>Reference Number:</strong> ${tender.referenceNumber || 'Not specified'}</li>
        </ul>
        <p>Please review the tender details and submit your bid by the deadline.</p>
        <p>Best regards,<br>Tender Management Team</p>
      `
    };

    await sendEmailWithRetry(mailOptions);
  }
}

// Function to check due dates and send advance notifications
async function checkDueDateNotifications() {
  const ADVANCE_DAYS = 3; // Notify 3 days in advance
  const now = new Date();
  const advanceDate = new Date(now);
  advanceDate.setDate(now.getDate() + ADVANCE_DAYS);

  logger.info(`Checking reminders for due dates between ${now.toISOString().split('T')[0]} and ${advanceDate.toISOString().split('T')[0]}`);

  const reminders = await prisma.reminder.findMany({
    where: {
      dueDate: {
        gte: new Date(now.toISOString().split('T')[0]), // Start of today
        lte: new Date(advanceDate.toISOString().split('T')[0] + 'T23:59:59.999Z') // End of advance date
      },
      type: 'tender_creation',
      tenderId: { not: null }
    },
    include: {
      user: true,
      customer: true,
      tender: true,
      category: true,
      subcategory: true,
      region: true
    }
  });

  if (reminders.length === 0) {
    logger.info('No reminders found within the advance notification window');
    return;
  }

  for (const reminder of reminders) {
    const recipient = reminder.user || reminder.customer;
    if (!recipient || !recipient.email || !reminder.tender) {
      logger.warn(`Skipping reminder ${reminder.id}: Missing recipient or tender`);
      continue;
    }

    const daysUntilDue = Math.ceil((reminder.dueDate - now) / (1000 * 60 * 60 * 24));
    const mailOptions = {
      from: '"Tender Management" <your_smtp_username@example.com>',
      to: recipient.email,
      subject: `Reminder: Tender "${reminder.tender.title}" Due in ${daysUntilDue} Day${daysUntilDue > 1 ? 's' : ''}`,
      text: `Dear ${recipient.name || 'User'},

This is a reminder for a tender matching your preferences, due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}:

- Title: ${reminder.tender.title}
- Description: ${reminder.tender.description}
- Category: ${reminder.category?.name || 'Not specified'}
- Subcategory: ${reminder.subcategory?.name || 'Not specified'}
- Region: ${reminder.region?.name || 'Not specified'}
- Due Date: ${new Date(reminder.dueDate).toLocaleDateString()}
- Reference Number: ${reminder.tender.referenceNumber || 'Not specified'}

Please review the tender details and submit your bid by the due date.

Best regards,
Tender Management Team`,
      html: `
        <h2>Tender Reminder</h2>
        <p>Dear ${recipient.name || 'User'},</p>
        <p>This is a reminder for a tender matching your preferences, due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}:</p>
        <ul>
          <li><strong>Title:</strong> ${reminder.tender.title}</li>
          <li><strong>Description:</strong> ${reminder.tender.description}</li>
          <li><strong>Category:</strong> ${reminder.category?.name || 'Not specified'}</li>
          <li><strong>Subcategory:</strong> ${reminder.subcategory?.name || 'Not specified'}</li>
          <li><strong>Region:</strong> ${reminder.region?.name || 'Not specified'}</li>
          <li><strong>Due Date:</strong> ${new Date(reminder.dueDate).toLocaleDateString()}</li>
          <li><strong>Reference Number:</strong> ${reminder.tender.referenceNumber || 'Not specified'}</li>
        </ul>
        <p>Please review the tender details and submit your bid by the due date.</p>
        <p>Best regards,<br>Tender Management Team</p>
      `
    };

    await sendEmailWithRetry(mailOptions);
    logger.info(`Sent advance notification for reminder ${reminder.id} to ${recipient.email}`);
  }
}

// Schedule due date checks daily at 8 AM (EAT)
cron.schedule('0 8 * * *', async () => {
  logger.info('Running daily due date notification check');
  await checkDueDateNotifications();
}, {
  timezone: 'Africa/Addis_Ababa'
});

// Example usage
async function main() {
  try {
    // Example: User registration
    const newUser = {
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'Customer'
    };
    await sendRegistrationNotification(newUser);

    // Example: Reminder preference update
    const user = { email: 'john.doe@example.com', name: 'John Doe' };
    const reminder = {
      type: 'tender_creation',
      dueDate: new Date('2025-08-02'),
      categoryId: 1,
      subcategoryId: 2,
      regionId: 3,
      tenderId: 1
    };
    await sendReminderUpdateNotification(user, reminder);

    // Example: Tender creation
    const tender = {
      id: 1,
      title: 'Construction Project 2025',
      description: 'Supply and installation of infrastructure.',
      categoryId: 1,
      subcategoryId: 2,
      regionId: 3,
      deadline: new Date('2025-08-02'),
      referenceNumber: 'TENDER-2025-001'
    };
    await sendTenderCreationNotification(tender);

    // Example: Manual due date check (for testing)
    await checkDueDateNotifications();
  } catch (error) {
    logger.error('Error in notification process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();