import request from 'supertest';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../src/config/env.js';

/**
 * Test helper utilities for MediConnect backend testing
 */

/**
 * Generate a JWT token for testing authenticated routes
 * @param {Object} user - User object to encode in token
 * @returns {string} JWT token
 */
export const generateTestToken = (user = global.testUtils.mockUser) => {
  // For testing with mock app, return mock token
  if (process.env.NODE_ENV === 'test') {
    return 'mock-jwt-token';
  }
  
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Create authenticated request helper
 * @param {Object} app - Express app instance
 * @param {Object} user - User to authenticate as
 * @returns {Object} Supertest request with auth header
 */
export const authenticatedRequest = (app, user = global.testUtils.mockUser) => {
  const token = generateTestToken(user);
  return request(app).set('Authorization', `Bearer ${token}`);
};

/**
 * Create a test database cleanup helper
 * @param {Object} db - Database instance
 * @param {Array} tables - Array of table names to clear
 */
export const cleanupTestData = async (db, tables = []) => {
  for (const table of tables) {
    try {
      await db.delete().from(table);
    } catch (error) {
      console.warn(`Failed to cleanup table ${table}:`, error.message);
    }
  }
};

/**
 * Mock request body validator
 * @param {Object} body - Request body to validate
 * @param {Array} requiredFields - Required field names
 * @returns {Object} Validation result
 */
export const validateRequestBody = (body, requiredFields) => {
  const missing = requiredFields.filter(field => !(field in body));
  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
};

/**
 * Create test appointment data
 * @param {Object} overrides - Override default values
 * @returns {Object} Test appointment data
 */
export const createTestAppointment = (overrides = {}) => {
  return {
    patientId: 'test-patient-id',
    doctorId: 'test-doctor-id',
    appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    appointmentTime: '10:00',
    reasonForVisit: 'Test consultation',
    appointmentMode: 'video',
    status: 'pending',
    ...overrides
  };
};

/**
 * Create test user data
 * @param {Object} overrides - Override default values
 * @returns {Object} Test user data
 */
export const createTestUser = (overrides = {}) => {
  return {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '+1234567890',
    role: 'patient',
    ...overrides
  };
};

/**
 * Create test medical record data
 * @param {Object} overrides - Override default values
 * @returns {Object} Test medical record data
 */
export const createTestMedicalRecord = (overrides = {}) => {
  return {
    patientId: 'test-patient-id',
    doctorId: 'test-doctor-id',
    appointmentId: 'test-appointment-id',
    diagnosis: 'Test diagnosis',
    treatment: 'Test treatment',
    notes: 'Test notes',
    ...overrides
  };
};

/**
 * Assert response structure helper
 * @param {Object} response - Supertest response
 * @param {number} expectedStatus - Expected HTTP status
 * @param {Object} expectedStructure - Expected response structure
 */
export const assertResponseStructure = (response, expectedStatus, expectedStructure = {}) => {
  expect(response.status).toBe(expectedStatus);
  
  if (expectedStructure.hasSuccess !== undefined) {
    expect(response.body).toHaveProperty('success', expectedStructure.hasSuccess);
  }
  
  if (expectedStructure.hasMessage) {
    expect(response.body).toHaveProperty('message');
  }
  
  if (expectedStructure.hasData) {
    expect(response.body).toHaveProperty('data');
  }
  
  if (expectedStructure.hasError) {
    expect(response.body).toHaveProperty('error');
  }
};

/**
 * Wait for async operations to complete
 * @param {number} ms - Milliseconds to wait
 */
export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock environment variables for testing
 * @param {Object} envVars - Environment variables to mock
 * @returns {Function} Cleanup function to restore original values
 */
export const mockEnvVars = (envVars) => {
  const originalValues = {};
  
  Object.keys(envVars).forEach(key => {
    originalValues[key] = process.env[key];
    process.env[key] = envVars[key];
  });
  
  // Return cleanup function
  return () => {
    Object.keys(originalValues).forEach(key => {
      if (originalValues[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValues[key];
      }
    });
  };
};
