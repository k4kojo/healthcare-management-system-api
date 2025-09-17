import cors from "cors";
import express from "express";

import job from "./config/cron.js";
import { NODE_ENV, PORT } from "./config/env.js";

import appointmentRouter from "./routes/appointment.route.js";
import chatMessagesRouter from "./routes/chat-message.route.js";
import chatRoomsRouter from "./routes/chat-rooms.route.js";
import consultationsRouter from "./routes/consultations.route.js";
import doctorAvailabilityRouter from "./routes/doctor-availability.route.js";
import doctorProfileRouter from "./routes/doctor-profile.route.js";
import labResultsRouter from "./routes/lab-results.route.js";
import medicalRecordsRouter from "./routes/medical-records.route.js";
import notificationsRouter from "./routes/notification.route.js";
import patientProfileRouter from "./routes/patient-profile.route.js";
import paymentsRouter from "./routes/payments.route.js";
import prescriptionsRouter from "./routes/prescriptions.route.js";
import reportsRouter from "./routes/reports.route.js";
import reviewsRouter from "./routes/reviews.route.js";
import userActivityLogsRouter from "./routes/user-activity-log.route.js";
import userSettingsRouter from "./routes/user-settings.route.js";
import userRouter from "./routes/user.route.js";
import userFeedbacksRouter from "./routes/userFeedbacks.route.js";
import ussdRouter from "./routes/ussd.route.js";

const app = express();

if (NODE_ENV === "production") job.start();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For USSD form data
// app.use(arcjetMiddleware);

app.get("/", (req, res) => {
  res.status(200).json({ success: true });
});

const API_PREFIX = "/api/v0";
app.use(`${API_PREFIX}/user`, userRouter);
app.use(`${API_PREFIX}/appointments`, appointmentRouter);
app.use(`${API_PREFIX}/chat-messages`, chatMessagesRouter);
app.use(`${API_PREFIX}/chat-rooms`, chatRoomsRouter);
app.use(`${API_PREFIX}/consultations`, consultationsRouter);
app.use(`${API_PREFIX}/doctor-availability`, doctorAvailabilityRouter);
app.use(`${API_PREFIX}/doctor-profiles`, doctorProfileRouter);
app.use(`${API_PREFIX}/lab-results`, labResultsRouter);
app.use(`${API_PREFIX}/medical-records`, medicalRecordsRouter);
app.use(`${API_PREFIX}/notifications`, notificationsRouter);
app.use(`${API_PREFIX}/payments`, paymentsRouter);
app.use(`${API_PREFIX}/prescriptions`, prescriptionsRouter);
app.use(`${API_PREFIX}/reports`, reportsRouter);
app.use(`${API_PREFIX}/reviews`, reviewsRouter);
app.use(`${API_PREFIX}/user-activity-logs`, userActivityLogsRouter);
app.use(`${API_PREFIX}/feedbacks`, userFeedbacksRouter);
app.use(`${API_PREFIX}/user-settings`, userSettingsRouter);
app.use(`${API_PREFIX}/patient-profile`, patientProfileRouter);
app.use(`${API_PREFIX}/ussd`, ussdRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
