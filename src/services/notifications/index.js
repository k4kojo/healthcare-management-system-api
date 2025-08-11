import emailService from "./email/provider.js";
import { renderTemplate } from "./email/template.js";
import inAppService from "./in-app/services.js";
import smsService from "./sms/provider.js";
import { NotificationType } from "./types.js";

class NotificationService {
  constructor() {
    console.log("Initializing NotificationService with providers");
    this.providers = {
      email: emailService,
      sms: smsService,
      inapp: inAppService,
    };
  }

  async send(notification) {
    console.log("-> Starting notification send process", {
      type: notification.type,
    });
    try {
      switch (notification.type) {
        case NotificationType.VERIFICATION:
          return this._sendVerification(notification);
        case NotificationType.PASSWORD_RESET:
          return this._sendPasswordReset(notification);
        case NotificationType.APPOINTMENT_REMINDER:
          return this._sendAppointmentReminder(notification);
        case NotificationType.SYSTEM:
          return this._sendSystemNotification(notification);
        default:
          throw new Error("Unknown notification type");
      }
    } catch (error) {
      console.error("Notification failed:", {
        error: error.message,
        stack: error.stack,
        notificationType: notification.type,
      });
      throw error;
    } finally {
      console.log("<- Completed notification send process");
    }
  }

  async _sendVerification({ user, channel = "email", token }) {
    console.log("Preparing verification notification", {
      email: user.email,
      channel,
    });
    const template = renderTemplate("verification", {
      firstName: user.firstName,
      lastName: user.lastName,
      token,
      expiresIn: "24 hours",
    });

    if (channel === "email") {
      console.log("Sending verification email", { to: user.email });
      return this.providers.email.send({
        to: user.email,
        subject: "Verify Your Account",
        html: template.html,
        text: template.text,
      });
    }

    if (channel === "sms") {
      console.log("Sending verification SMS", { to: user.phoneNumber });
      return this.providers.sms.send({
        to: user.phoneNumber,
        body: template.text,
      });
    }
  }

  async _sendPasswordReset({ user, channel = "email", token }) {
    console.log("Preparing password reset notification", {
      email: user.email,
      channel,
    });
    const template = renderTemplate("passwordReset", {
      firstName: user.firstName,
      lastName: user.lastName,
      token,
      expiresIn: "60 seconds",
    });

    if (channel === "email") {
      console.log("Sending password reset email", { to: user.email });
      return this.providers.email.send({
        to: user.email,
        subject: "Password Reset Request",
        html: template.html,
        text: template.text,
      });
    }

    if (channel === "sms") {
      console.log("Sending password reset SMS", { to: user.phoneNumber });
      return this.providers.sms.send({
        to: user.phoneNumber,
        body: template.text,
      });
    }
  }

  async _sendAppointmentReminder({ user, appointment }) {
    console.log("Preparing appointment reminder", {
      userId: user.userId,
      appointmentId: appointment.id,
    });
    const template = renderTemplate("appointmentReminder", {
      firstName: user.firstName,
      lastName: user.lastName,
      date: appointment.date,
      doctor: appointment.doctorName,
      location: appointment.location,
    });

    console.log("Sending appointment reminder notifications");
    await Promise.all([
      this.providers.email.send({
        to: user.email,
        subject: "Appointment Reminder",
        html: template.html,
        text: template.text,
      }),
      this.providers.inapp.create({
        userId: user.userId,
        title: "Appointment Reminder",
        body: template.text,
        type: "appointment",
        metadata: { appointmentId: appointment.id },
      }),
    ]);
    console.log("Appointment reminders sent successfully");
  }

  async _sendSystemNotification({ user, title, message, metadata = {} }) {
    console.log("Sending system notification", {
      userId: user.userId,
      title,
    });
    return this.providers.inapp.create({
      userId: user.userId,
      title,
      body: message,
      type: "system",
      metadata,
    });
  }
}

export default new NotificationService();
