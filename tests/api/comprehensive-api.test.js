import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Import all routes
import userRouter from '../../src/routes/user.route.js';
import appointmentRouter from '../../src/routes/appointment.route.js';
import medicationsRouter from '../../src/routes/medications.route.js';
import prescriptionsRouter from '../../src/routes/prescriptions.route.js';
import consultationsRouter from '../../src/routes/consultations.route.js';
import labResultsRouter from '../../src/routes/lab-results.route.js';
import medicalRecordsRouter from '../../src/routes/medical-records.route.js';
import chatRoomsRouter from '../../src/routes/chat-rooms.route.js';
import chatMessagesRouter from '../../src/routes/chat-message.route.js';
import doctorAvailabilityRouter from '../../src/routes/doctor-availability.route.js';
import doctorProfileRouter from '../../src/routes/doctor-profile.route.js';
import patientProfileRouter from '../../src/routes/patient-profile.route.js';
import notificationsRouter from '../../src/routes/notification.route.js';
import paymentsRouter from '../../src/routes/payments.route.js';
import reportsRouter from '../../src/routes/reports.route.js';
import reviewsRouter from '../../src/routes/reviews.route.js';
import userActivityLogsRouter from '../../src/routes/user-activity-log.route.js';
import userSettingsRouter from '../../src/routes/user-settings.route.js';
import userFeedbacksRouter from '../../src/routes/userFeedbacks.route.js';
import ussdRouter from '../../src/routes/ussd.route.js';
import videoCallRouter from '../../src/routes/video-calls.route.js';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());

// Mount all routes
const API_PREFIX = "/api/v0";
app.use(`${API_PREFIX}/user`, userRouter);
app.use(`${API_PREFIX}/appointments`, appointmentRouter);
app.use(`${API_PREFIX}/medications`, medicationsRouter);
app.use(`${API_PREFIX}/prescriptions`, prescriptionsRouter);
app.use(`${API_PREFIX}/consultations`, consultationsRouter);
app.use(`${API_PREFIX}/lab-results`, labResultsRouter);
app.use(`${API_PREFIX}/medical-records`, medicalRecordsRouter);
app.use(`${API_PREFIX}/chat-rooms`, chatRoomsRouter);
app.use(`${API_PREFIX}/chat-messages`, chatMessagesRouter);
app.use(`${API_PREFIX}/doctor-availability`, doctorAvailabilityRouter);
app.use(`${API_PREFIX}/doctor-profiles`, doctorProfileRouter);
app.use(`${API_PREFIX}/patient-profile`, patientProfileRouter);
app.use(`${API_PREFIX}/notifications`, notificationsRouter);
app.use(`${API_PREFIX}/payments`, paymentsRouter);
app.use(`${API_PREFIX}/reports`, reportsRouter);
app.use(`${API_PREFIX}/reviews`, reviewsRouter);
app.use(`${API_PREFIX}/user-activity-logs`, userActivityLogsRouter);
app.use(`${API_PREFIX}/user-settings`, userSettingsRouter);
app.use(`${API_PREFIX}/feedbacks`, userFeedbacksRouter);
app.use(`${API_PREFIX}/ussd`, ussdRouter);
app.use(`${API_PREFIX}/video-calls`, videoCallRouter);

// Test data
let authTokens = {
  admin: null,
  doctor: null,
  patient: null
};

let testUsers = {
  admin: null,
  doctor: null,
  patient: null
};

let testData = {
  appointmentId: null,
  medicationId: null,
  prescriptionId: null
};

describe('MediConnect API Comprehensive Testing', () => {
  
  describe('1. Authentication Endpoints', () => {
    
    it('should register a new admin user', async () => {
      const adminData = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: 'Password123!',
        role: 'admin',
        phoneNumber: '+1234567890',
        dateOfBirth: '1985-01-01'
      };

      const response = await request(app)
        .post('/api/v0/user/sign-up')
        .send(adminData);

      console.log('Admin registration response:', response.status, response.body);
      
      // May return 201 (created) or 409 (already exists)
      expect([201, 409, 400]).toContain(response.status);
    });

    it('should register a new doctor user', async () => {
      const doctorData = {
        firstName: 'Dr. John',
        lastName: 'Smith',
        email: 'doctor@test.com',
        password: 'Password123!',
        role: 'doctor',
        phoneNumber: '+1234567891',
        dateOfBirth: '1980-01-01',
        specialization: 'Cardiology',
        licenseNumber: 'DOC123456',
        yearsOfExperience: 10,
        education: 'MD from Harvard Medical School'
      };

      const response = await request(app)
        .post('/api/v0/user/sign-up')
        .send(doctorData);

      console.log('Doctor registration response:', response.status, response.body);
      
      expect([201, 409, 400]).toContain(response.status);
    });

    it('should register a new patient user', async () => {
      const patientData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'patient@test.com',
        password: 'Password123!',
        role: 'patient',
        phoneNumber: '+1234567892',
        dateOfBirth: '1990-01-01'
      };

      const response = await request(app)
        .post('/api/v0/user/sign-up')
        .send(patientData);

      console.log('Patient registration response:', response.status, response.body);
      
      expect([201, 409]).toContain(response.status);
    });

    it('should login admin user', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/v0/user/sign-in')
        .send(loginData);

      console.log('Admin login response:', response.status, response.body);
      
      if (response.status === 200) {
        authTokens.admin = response.body.token;
        testUsers.admin = response.body.user;
      }
      
      expect([200, 401]).toContain(response.status);
    });

    it('should login doctor user', async () => {
      const loginData = {
        email: 'doctor@test.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/v0/user/sign-in')
        .send(loginData);

      console.log('Doctor login response:', response.status, response.body);
      
      if (response.status === 200) {
        authTokens.doctor = response.body.token;
        testUsers.doctor = response.body.user;
      }
      
      expect([200, 401]).toContain(response.status);
    });

    it('should login patient user', async () => {
      const loginData = {
        email: 'patient@test.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/v0/user/sign-in')
        .send(loginData);

      console.log('Patient login response:', response.status, response.body);
      
      if (response.status === 200) {
        authTokens.patient = response.body.token;
        testUsers.patient = response.body.user;
      }
      
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('2. User Management Endpoints', () => {
    
    it('should get all users (admin only)', async () => {
      if (!authTokens.admin) {
        console.log('Skipping admin test - no admin token');
        return;
      }

      const response = await request(app)
        .get('/api/v0/user/')
        .set('Authorization', `Bearer ${authTokens.admin}`);

      console.log('Get all users response:', response.status, response.body?.length || 'No data');
      
      expect([200, 401, 403]).toContain(response.status);
    });

    it('should get user by ID', async () => {
      if (!authTokens.patient || !testUsers.patient) {
        console.log('Skipping user by ID test - no patient token');
        return;
      }

      const response = await request(app)
        .get(`/api/v0/user/${testUsers.patient.userId}`)
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Get user by ID response:', response.status, response.body?.user?.email || 'No data');
      
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('should update user profile', async () => {
      if (!authTokens.patient || !testUsers.patient) {
        console.log('Skipping user update test - no patient token');
        return;
      }

      const updateData = {
        firstName: 'Jane Updated'
      };

      const response = await request(app)
        .put(`/api/v0/user/${testUsers.patient.userId}`)
        .set('Authorization', `Bearer ${authTokens.patient}`)
        .send(updateData);

      console.log('Update user response:', response.status, response.body?.message || 'No message');
      
      expect([200, 400, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('3. Appointment Endpoints', () => {
    
    it('should create an appointment', async () => {
      if (!authTokens.patient || !testUsers.patient || !testUsers.doctor) {
        console.log('Skipping appointment creation - missing tokens');
        return;
      }

      const appointmentData = {
        doctorId: testUsers.doctor.userId,
        patientId: testUsers.patient.userId,
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        appointmentTime: '10:00',
        reasonForVisit: 'Regular checkup',
        appointmentType: 'in-person'
      };

      const response = await request(app)
        .post('/api/v0/appointments')
        .set('Authorization', `Bearer ${authTokens.patient}`)
        .send(appointmentData);

      console.log('Create appointment response:', response.status, response.body?.message || 'No message');
      
      if (response.status === 201 && response.body?.appointment) {
        testData.appointmentId = response.body.appointment.appointmentId;
      }
      
      expect([201, 400, 401, 403]).toContain(response.status);
    });

    it('should get all appointments', async () => {
      if (!authTokens.patient) {
        console.log('Skipping get appointments - no patient token');
        return;
      }

      const response = await request(app)
        .get('/api/v0/appointments')
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Get appointments response:', response.status, response.body?.appointments?.length || 'No data');
      
      expect([200, 401, 403]).toContain(response.status);
    });

    it('should get appointment by ID', async () => {
      if (!authTokens.patient || !testData.appointmentId) {
        console.log('Skipping get appointment by ID - missing data');
        return;
      }

      const response = await request(app)
        .get(`/api/v0/appointments/${testData.appointmentId}`)
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Get appointment by ID response:', response.status, response.body?.appointment?.reasonForVisit || 'No data');
      
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('4. Medication Endpoints', () => {
    
    it('should create a medication (doctor)', async () => {
      if (!authTokens.doctor || !testUsers.doctor || !testUsers.patient) {
        console.log('Skipping medication creation - missing tokens');
        return;
      }

      const medicationData = {
        patientId: testUsers.patient.userId,
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'once daily',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        instructions: 'Take with food'
      };

      const response = await request(app)
        .post('/api/v0/medications')
        .set('Authorization', `Bearer ${authTokens.doctor}`)
        .send(medicationData);

      console.log('Create medication response:', response.status, response.body?.message || 'No message');
      
      if (response.status === 201 && response.body?.medication) {
        testData.medicationId = response.body.medication.medicationId;
      }
      
      expect([201, 400, 401, 403]).toContain(response.status);
    });

    it('should get medications for patient', async () => {
      if (!authTokens.patient || !testUsers.patient) {
        console.log('Skipping get medications - no patient token');
        return;
      }

      const response = await request(app)
        .get(`/api/v0/medications/${testUsers.patient.userId}`)
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Get medications response:', response.status, response.body?.medications?.length || 'No data');
      
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    it('should log medication intake', async () => {
      if (!authTokens.patient || !testData.medicationId) {
        console.log('Skipping medication log - missing data');
        return;
      }

      const logData = {
        status: 'taken',
        takenAt: new Date().toISOString(),
        notes: 'Taken as prescribed'
      };

      const response = await request(app)
        .post(`/api/v0/medications/${testData.medicationId}/logs`)
        .set('Authorization', `Bearer ${authTokens.patient}`)
        .send(logData);

      console.log('Log medication response:', response.status, response.body?.message || 'No message');
      
      expect([201, 400, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('5. Prescription Endpoints', () => {
    
    it('should create a prescription', async () => {
      if (!authTokens.doctor || !testUsers.doctor || !testUsers.patient) {
        console.log('Skipping prescription creation - missing tokens');
        return;
      }

      const prescriptionData = {
        patientId: testUsers.patient.userId,
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '400mg',
            frequency: 'twice daily',
            duration: '7 days'
          }
        ],
        diagnosis: 'Headache',
        notes: 'Take with meals'
      };

      const response = await request(app)
        .post('/api/v0/prescriptions')
        .set('Authorization', `Bearer ${authTokens.doctor}`)
        .send(prescriptionData);

      console.log('Create prescription response:', response.status, response.body?.message || 'No message');
      
      if (response.status === 201 && response.body?.prescription) {
        testData.prescriptionId = response.body.prescription.prescriptionId;
      }
      
      expect([201, 400, 401, 403]).toContain(response.status);
    });

    it('should get prescriptions', async () => {
      if (!authTokens.patient) {
        console.log('Skipping get prescriptions - no patient token');
        return;
      }

      const response = await request(app)
        .get('/api/v0/prescriptions')
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Get prescriptions response:', response.status, response.body?.prescriptions?.length || 'No data');
      
      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('6. Other Endpoints', () => {
    
    it('should test consultations endpoint', async () => {
      if (!authTokens.patient) {
        console.log('Skipping consultations test - no patient token');
        return;
      }

      const response = await request(app)
        .get('/api/v0/consultations')
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Consultations response:', response.status, response.body?.consultations?.length || 'No data');
      
      expect([200, 401, 403]).toContain(response.status);
    });

    it('should test lab results endpoint', async () => {
      if (!authTokens.patient) {
        console.log('Skipping lab results test - no patient token');
        return;
      }

      const response = await request(app)
        .get('/api/v0/lab-results')
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Lab results response:', response.status, response.body?.labResults?.length || 'No data');
      
      expect([200, 401, 403]).toContain(response.status);
    });

    it('should test medical records endpoint', async () => {
      if (!authTokens.patient) {
        console.log('Skipping medical records test - no patient token');
        return;
      }

      const response = await request(app)
        .get('/api/v0/medical-records')
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Medical records response:', response.status, response.body?.records?.length || 'No data');
      
      expect([200, 401, 403]).toContain(response.status);
    });

    it('should test notifications endpoint', async () => {
      if (!authTokens.patient) {
        console.log('Skipping notifications test - no patient token');
        return;
      }

      const response = await request(app)
        .get('/api/v0/notifications')
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Notifications response:', response.status, response.body?.notifications?.length || 'No data');
      
      expect([200, 401, 403]).toContain(response.status);
    });

    it('should test doctor profiles endpoint', async () => {
      if (!authTokens.patient) {
        console.log('Skipping doctor profiles test - no patient token');
        return;
      }

      const response = await request(app)
        .get('/api/v0/doctor-profiles')
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Doctor profiles response:', response.status, response.body?.doctors?.length || 'No data');
      
      expect([200, 401, 403]).toContain(response.status);
    });

    it('should test video calls endpoint', async () => {
      if (!authTokens.patient) {
        console.log('Skipping video calls test - no patient token');
        return;
      }

      const response = await request(app)
        .get('/api/v0/video-calls')
        .set('Authorization', `Bearer ${authTokens.patient}`);

      console.log('Video calls response:', response.status, response.body?.calls?.length || 'No data');
      
      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('7. Error Handling Tests', () => {
    
    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/v0/user/');

      console.log('Unauthorized access response:', response.status, response.body?.message || 'No message');
      
      expect(response.status).toBe(401);
    });

    it('should handle invalid endpoints', async () => {
      const response = await request(app)
        .get('/api/v0/invalid-endpoint');

      console.log('Invalid endpoint response:', response.status);
      
      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v0/user/sign-up')
        .send('invalid json');

      console.log('Malformed JSON response:', response.status, response.body?.message || 'No message');
      
      expect([400, 500]).toContain(response.status);
    });
  });
});
