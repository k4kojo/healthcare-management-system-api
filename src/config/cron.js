import cron from 'cron';
import https from 'https';
import { API_URL } from './env.js';
import { processPendingReminders, cleanupOldReminders } from '../services/reminder.service.js';

// Keep server alive job (every 14 minutes)
const keepAliveJob = new cron.CronJob('*/14 * * * *', () => {
  https.get(API_URL, (res) => {
    if (res.statusCode === 200) console.log('GET request sent successfully');
    else console.log('GET request failed', res.statusCode);
  }).on('error', (err) => {
    console.error('Error sending GET request', err);
  });
});

// Medication reminder job (every 5 minutes)
const medicationReminderJob = new cron.CronJob('*/5 * * * *', async () => {
  try {
    console.log('🔔 Processing medication reminders...');
    const processedCount = await processPendingReminders();
    if (processedCount > 0) {
      console.log(`✅ Processed ${processedCount} medication reminders`);
    }
  } catch (error) {
    console.error('❌ Error processing medication reminders:', error);
  }
});

// Cleanup old reminders job (daily at 2 AM)
const cleanupJob = new cron.CronJob('0 2 * * *', async () => {
  try {
    console.log('🧹 Cleaning up old medication reminders...');
    const cleanedCount = await cleanupOldReminders();
    console.log(`✅ Cleaned up ${cleanedCount} old reminders`);
  } catch (error) {
    console.error('❌ Error cleaning up old reminders:', error);
  }
});

// Combined job manager
const jobManager = {
  start: () => {
    keepAliveJob.start();
    medicationReminderJob.start();
    cleanupJob.start();
    console.log('📅 All cron jobs started');
  },
  stop: () => {
    keepAliveJob.stop();
    medicationReminderJob.stop();
    cleanupJob.stop();
    console.log('📅 All cron jobs stopped');
  }
};

export default jobManager;