import AfricasTalking from "africastalking";
import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import {
  AFRICASTALKING_API_KEY,
  AFRICASTALKING_SHORTCODE,
  AFRICASTALKING_USERNAME,
} from "../config/env.js";
import { appointments } from "../db/schema/appointments.js";
import { doctorProfile } from "../db/schema/doctorProfile.js";
import { users } from "../db/schema/users.js";

class USSDService {
  constructor() {
    // Initialize Africa's Talking only if credentials are available
    if (AFRICASTALKING_API_KEY && AFRICASTALKING_USERNAME) {
      this.africastalking = AfricasTalking({
        apiKey: AFRICASTALKING_API_KEY,
        username: AFRICASTALKING_USERNAME,
      });
      this.isConfigured = true;
    } else {
      console.warn(
        "Africa's Talking credentials not configured. USSD service will work in demo mode."
      );
      this.isConfigured = false;
    }

    // In-memory session storage (in production, use Redis or database)
    this.sessions = new Map();
  }

  // USSD Menu Flow Structure
  async handleUSSDRequest(sessionId, phoneNumber, text) {
    try {
      let session = this.getSession(sessionId, phoneNumber);
      const input = text.split("*").pop() || "";

      // Main menu flow
      if (text === "") {
        return this.showMainMenu();
      }

      const menuLevel = text.split("*").length;
      const inputs = text.split("*");

      switch (menuLevel) {
        case 1:
          return await this.handleMainMenuSelection(session, input);
        case 2:
          return await this.handleSecondLevel(session, inputs);
        case 3:
          return await this.handleThirdLevel(session, inputs);
        case 4:
          return await this.handleFourthLevel(session, inputs);
        case 5:
          return await this.handleFifthLevel(session, inputs);
        default:
          return this.showMainMenu();
      }
    } catch (error) {
      console.error("USSD Error:", error);
      return {
        response: "END Sorry, an error occurred. Please try again later.",
        continue: false,
      };
    }
  }

  showMainMenu() {
    return {
      response: `CON Welcome to MediConnect
        1. Book Appointment
        2. View My Appointments
        3. Cancel Appointment
        4. Contact Support`,
      continue: true,
    };
  }

  async handleMainMenuSelection(session, input) {
    switch (input) {
      case "1":
        session.flow = "book_appointment";
        session.step = "verify_patient";
        return await this.verifyPatient(session);
      case "2":
        session.flow = "view_appointments";
        return await this.viewAppointments(session);
      case "3":
        session.flow = "cancel_appointment";
        return await this.showCancelMenu(session);
      case "4":
        return {
          response:
            "END For support, call +233-XXX-XXXX or email support@mediconnect.com",
          continue: false,
        };
      default:
        return {
          response:
            "CON Invalid selection. Please try again.\n" +
            this.showMainMenu().response.substring(4),
          continue: true,
        };
    }
  }

  async handleSecondLevel(session, inputs) {
    const input = inputs[1];

    if (session.flow === "book_appointment") {
      if (session.step === "verify_patient") {
        // Check if patient exists
        const patient = await this.findPatientByPhone(session.phoneNumber);
        if (!patient) {
          return {
            response:
              "END You are not registered. Please register through the mobile app first.",
            continue: false,
          };
        }
        session.patientId = patient.userId;
        session.step = "select_doctor";
        return await this.showDoctors();
      }
    }

    return this.showMainMenu();
  }

  async handleThirdLevel(session, inputs) {
    const input = inputs[2];

    if (
      session.flow === "book_appointment" &&
      session.step === "select_doctor"
    ) {
      const doctors = await this.getDoctors();
      const selectedDoctor = doctors[parseInt(input) - 1];

      if (!selectedDoctor) {
        return {
          response:
            "CON Invalid doctor selection. Please try again.\n" +
            (await this.showDoctors()).response.substring(4),
          continue: true,
        };
      }

      session.doctorId = selectedDoctor.userId;
      session.doctorName = `${selectedDoctor.firstName} ${selectedDoctor.lastName}`;
      session.step = "select_date";
      return this.showAvailableDates();
    }

    return this.showMainMenu();
  }

  async handleFourthLevel(session, inputs) {
    const input = inputs[3];

    if (session.flow === "book_appointment" && session.step === "select_date") {
      const dates = this.getAvailableDates();
      const selectedDate = dates[parseInt(input) - 1];

      if (!selectedDate) {
        return {
          response:
            "CON Invalid date selection. Please try again.\n" +
            this.showAvailableDates().response.substring(4),
          continue: true,
        };
      }

      session.appointmentDate = selectedDate;
      session.step = "select_time";
      return this.showAvailableTimes();
    }

    return this.showMainMenu();
  }

  async handleFifthLevel(session, inputs) {
    const input = inputs[4];

    if (session.flow === "book_appointment" && session.step === "select_time") {
      const times = this.getAvailableTimes();
      const selectedTime = times[parseInt(input) - 1];

      if (!selectedTime) {
        return {
          response:
            "CON Invalid time selection. Please try again.\n" +
            this.showAvailableTimes().response.substring(4),
          continue: true,
        };
      }

      session.appointmentTime = selectedTime;
      return await this.confirmBooking(session);
    }

    return this.showMainMenu();
  }

  async verifyPatient(session) {
    const patient = await this.findPatientByPhone(session.phoneNumber);
    if (!patient) {
      return {
        response:
          "END You are not registered. Please register through the mobile app first.",
        continue: false,
      };
    }

    session.patientId = patient.userId;
    session.patientName = `${patient.firstName} ${patient.lastName}`;
    return await this.showDoctors();
  }

  async showDoctors() {
    const doctors = await this.getDoctors();
    let response = "CON Select a doctor:\n";

    doctors.forEach((doctor, index) => {
      response += `${index + 1}. Dr. ${doctor.firstName} ${doctor.lastName} - ${
        doctor.specialization
      }\n`;
    });

    return {
      response: response.trim(),
      continue: true,
    };
  }

  showAvailableDates() {
    const dates = this.getAvailableDates();
    let response = "CON Select appointment date:\n";

    dates.forEach((date, index) => {
      response += `${index + 1}. ${date}\n`;
    });

    return {
      response: response.trim(),
      continue: true,
    };
  }

  showAvailableTimes() {
    const times = this.getAvailableTimes();
    let response = "CON Select appointment time:\n";

    times.forEach((time, index) => {
      response += `${index + 1}. ${time}\n`;
    });

    return {
      response: response.trim(),
      continue: true,
    };
  }

  async confirmBooking(session) {
    try {
      const appointmentDateTime = new Date(
        `${session.appointmentDate} ${session.appointmentTime}`
      );

      // Create appointment
      const [appointment] = await db
        .insert(appointments)
        .values({
          appointmentId: crypto.randomUUID(),
          patientId: session.patientId,
          doctorId: session.doctorId,
          appointmentDate: appointmentDateTime,
          appointmentMode: "Online", // Default for USSD bookings
          reasonForVisit: "Booked via USSD",
          appointmentAmount: 50.0, // Default amount
          status: "pending",
        })
        .returning();

      // Send SMS confirmation
      await this.sendSMSConfirmation(session.phoneNumber, appointment, session);

      return {
        response: `END Appointment booked successfully!
          Doctor: ${session.doctorName}
          Date: ${session.appointmentDate}
          Time: ${session.appointmentTime}
          Ref: ${appointment.appointmentId.substring(0, 8)}
          You will receive an SMS confirmation.`,
        continue: false,
      };
    } catch (error) {
      console.error("Booking error:", error);
      return {
        response: "END Sorry, booking failed. Please try again later.",
        continue: false,
      };
    }
  }

  async viewAppointments(session) {
    try {
      const patient = await this.findPatientByPhone(session.phoneNumber);
      if (!patient) {
        return {
          response:
            "END You are not registered. Please register through the mobile app first.",
          continue: false,
        };
      }

      const userAppointments = await db
        .select({
          appointmentId: appointments.appointmentId,
          appointmentDate: appointments.appointmentDate,
          status: appointments.status,
          doctorFirstName: users.firstName,
          doctorLastName: users.lastName,
          specialization: doctorProfile.specialization,
        })
        .from(appointments)
        .leftJoin(users, eq(users.userId, appointments.doctorId))
        .leftJoin(
          doctorProfile,
          eq(doctorProfile.doctorId, appointments.doctorId)
        )
        .where(eq(appointments.patientId, patient.userId))
        .limit(5);

      if (userAppointments.length === 0) {
        return {
          response: "END You have no appointments.",
          continue: false,
        };
      }

      let response = "END Your appointments:\n";
      userAppointments.forEach((apt, index) => {
        const date = new Date(apt.appointmentDate).toLocaleDateString();
        response += `${index + 1}. Dr. ${apt.doctorFirstName} ${
          apt.doctorLastName
        }\n`;
        response += `   ${date} - ${apt.status}\n`;
      });

      return {
        response: response.trim(),
        continue: false,
      };
    } catch (error) {
      console.error("View appointments error:", error);
      return {
        response: "END Error retrieving appointments.",
        continue: false,
      };
    }
  }

  async showCancelMenu(session) {
    try {
      const patient = await this.findPatientByPhone(session.phoneNumber);
      if (!patient) {
        return {
          response: "END You are not registered.",
          continue: false,
        };
      }

      const userAppointments = await db
        .select({
          appointmentId: appointments.appointmentId,
          appointmentDate: appointments.appointmentDate,
          doctorFirstName: users.firstName,
          doctorLastName: users.lastName,
        })
        .from(appointments)
        .leftJoin(users, eq(users.userId, appointments.doctorId))
        .where(
          and(
            eq(appointments.patientId, patient.userId),
            eq(appointments.status, "pending")
          )
        )
        .limit(5);

      if (userAppointments.length === 0) {
        return {
          response: "END No pending appointments to cancel.",
          continue: false,
        };
      }

      let response = "CON Select appointment to cancel:\n";
      userAppointments.forEach((apt, index) => {
        const date = new Date(apt.appointmentDate).toLocaleDateString();
        response += `${index + 1}. Dr. ${apt.doctorFirstName} ${
          apt.doctorLastName
        } - ${date}\n`;
      });

      session.cancelAppointments = userAppointments;
      return {
        response: response.trim(),
        continue: true,
      };
    } catch (error) {
      console.error("Cancel menu error:", error);
      return {
        response: "END Error loading appointments.",
        continue: false,
      };
    }
  }

  async sendSMSConfirmation(phoneNumber, appointment, session) {
    try {
      const message = `MediConnect: Your appointment is confirmed!
Doctor: ${session.doctorName}
Date: ${session.appointmentDate} ${session.appointmentTime}
Reference: ${appointment.appointmentId.substring(0, 8)}
Please arrive 15 minutes early.`;

      if (this.isConfigured) {
        await this.africastalking.SMS.send({
          to: [phoneNumber],
          message: message,
          from: AFRICASTALKING_SHORTCODE || "MediConnect",
        });
      } else {
        console.log("Demo mode - SMS would be sent:", message);
      }
    } catch (error) {
      console.error("SMS sending error:", error);
    }
  }

  // Helper methods
  async findPatientByPhone(phoneNumber) {
    try {
      const [patient] = await db
        .select()
        .from(users)
        .where(eq(users.phoneNumber, phoneNumber));
      return patient;
    } catch (error) {
      console.error("Find patient error:", error);
      return null;
    }
  }

  async getDoctors() {
    try {
      const doctors = await db
        .select({
          userId: users.userId,
          firstName: users.firstName,
          lastName: users.lastName,
          specialization: doctorProfile.specialization,
        })
        .from(users)
        .leftJoin(doctorProfile, eq(doctorProfile.doctorId, users.userId))
        .where(eq(users.role, "doctor"))
        .limit(10);

      return doctors;
    } catch (error) {
      console.error("Get doctors error:", error);
      return [];
    }
  }

  getAvailableDates() {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toLocaleDateString("en-GB"));
    }

    return dates;
  }

  getAvailableTimes() {
    return [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
    ];
  }

  getSession(sessionId, phoneNumber) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        sessionId,
        phoneNumber,
        flow: null,
        step: null,
        data: {},
      });
    }
    return this.sessions.get(sessionId);
  }

  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}

export default new USSDService();
