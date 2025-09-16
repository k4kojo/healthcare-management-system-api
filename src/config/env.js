import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  NODE_ENV,
  DATABASE_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM_NAME,
  EMAIL_FROM_ADDRESS,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  ARCJET_KEY,
  ARCJET_ENV,
  API_URL,
  AFRICASTALKING_API_KEY,
  AFRICASTALKING_USERNAME,
  AFRICASTALKING_SHORTCODE,
  USSD_SERVICE_CODE,
  USSD_WEBHOOK_URL
} = process.env;

// Optional OAuth provider configuration
export const { GOOGLE_CLIENT_IDS, APPLE_CLIENT_ID } = process.env;

// Firebase Admin credentials for minting custom auth tokens
export const {
  FIREBASE_ADMIN_CREDENTIALS,
  FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY,
} = process.env;
