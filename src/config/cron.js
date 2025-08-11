import cron from 'cron';
import https from 'https';
import { API_URL } from './env.js';

const job = new cron.CronJob('*/14 * * * *', () => {
  https.get(API_URL, (res) => {
    if (res.statusCode === 200) console.log('GET request sent successfully');
    else console.log('GET request failed', res.statusCode);
  }).on('error', (err) => {
    console.error('Error sending GET request', err);
  });
});

export default job;