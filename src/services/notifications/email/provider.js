import nodemailer from "nodemailer";
import {
  EMAIL_FROM_ADDRESS,
  EMAIL_FROM_NAME,
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
} from "../../../config/env.js";

console.log("Initializing email transporter");
// Prefer explicit SMTP host/port if provided, else fall back to Gmail service
const transporter = nodemailer.createTransport(
  EMAIL_HOST
    ? {
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT) || 587,
        secure: String(EMAIL_SECURE).toLowerCase() === "true", // true for 465, false for others
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
      }
    : {
        service: "gmail",
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
      }
);

export default {
  async send({ to, subject, html, text }) {
    console.log("-> Starting email send process", { to, subject });
    try {
      const mailOptions = {
        from: `"${EMAIL_FROM_NAME || EMAIL_USER}" <${EMAIL_FROM_ADDRESS || EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      };

      console.log("Sending email with options:", {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
      });

      const info = await transporter.sendMail(mailOptions);

      console.log("Email sent successfully:", {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      });

      return info;
    } catch (error) {
      console.error("Email failed with details:", {
        error: error.message,
        stack: error.stack,
        response: error.response,
        to,
        subject,
      });
      throw error;
    } finally {
      console.log("<- Completed email send process");
    }
  },
};
