import twilio from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} from "../../../config/env.js";

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export default {
  async send({ to, body }) {
    try {
      const message = await client.messages.create({
        body,
        from: TWILIO_PHONE_NUMBER,
        to,
      });

      console.log(`✅ SMS sent to ${to}: SID ${message.sid}`);
      return message;
    } catch (error) {
      console.error(`❌ SMS failed to ${to}:`, error.message);
      throw error;
    }
  },
};
