// projectRoot/utili/Scheduler.js
console.log('Scheduler.js file is being loaded');

try {
  const cron = require('node-cron');
  console.log('node-cron loaded');
const prisma=require('../config/db')
  // Adjusted path: utili/ to config/
  console.log('Prisma loaded');
  const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 0 * * *';
  const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 1000;
  console.log('Environment variables set:', { CRON_SCHEDULE, BATCH_SIZE });

  // Retry logic for transient errors
  async function withRetry(operation, maxRetries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        console.warn(`Retry ${attempt}/${maxRetries} failed: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // Subscription check logic
  async function runSubscriptionCheck() {
    try {
      console.log('Starting subscription status check for customers with reminders...');
      const currentDate = new Date();
      let totalUpdated = 0;
      let skip = 0;

      while (true) {
        const batch = await withRetry(() =>
          prisma.customer.findMany({
            where: {
              isSubscribed: true,
              endDate: { lte: currentDate },
              reminders: { some: {} },
            },
            select: { id: true },
            skip,
            take: BATCH_SIZE,
          })
        );

        if (batch.length === 0) break;

        await withRetry(() =>
          prisma.$transaction([
            prisma.customer.updateMany({
              where: { id: { in: batch.map((customer) => customer.id) } },
              data: { isSubscribed: false },
            }),
            prisma.activityLog.createMany({
              data: batch.map((customer) => ({
                customerId: customer.id,
                action: 'SUBSCRIPTION_EXPIRED',
                details: `Subscription expired due to endDate ${currentDate.toISOString()}`,
                createdAt: currentDate,
              })),
            }),
          ])
        );

        totalUpdated += batch.length;
        skip += BATCH_SIZE;
      }

      console.log(`Completed check. Updated ${totalUpdated} customers' subscription status.`);
    } catch (error) {
      console.error('Error in subscription status check:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  // Schedule the task in EAT timezone
  cron.schedule(CRON_SCHEDULE, runSubscriptionCheck, { timezone: 'Africa/Nairobi' });
  console.log(`Subscription status checker scheduled with cron: ${CRON_SCHEDULE}`);

  module.exports = { runSubscriptionCheck };
} catch (error) {
  console.error('Error initializing Scheduler.js:', error);
}