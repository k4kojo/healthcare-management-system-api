import AfricasTalking from "africastalking";
import {
  AFRICASTALKING_API_KEY,
  AFRICASTALKING_USERNAME,
} from "../../../config/env.js";

// Initialize AfricasTalking
let smsService = null;
if (AFRICASTALKING_API_KEY && AFRICASTALKING_USERNAME) {
  const africastalking = AfricasTalking({
    apiKey: AFRICASTALKING_API_KEY,
    username: AFRICASTALKING_USERNAME,
  });
  smsService = africastalking.SMS;
}

export default {
  async send({ to, body }) {
    try {
      if (!smsService) {
        console.warn("AfricasTalking SMS not configured. SMS not sent.");
        return { status: "not_configured", message: "SMS service not configured" };
      }

      const result = await smsService.send({
        to: [to], // AfricasTalking expects an array
        message: body,
      });

      console.log(`✅ SMS sent to ${to}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ SMS failed to ${to}:`, error.message);
      throw error;
    }
  },
};
