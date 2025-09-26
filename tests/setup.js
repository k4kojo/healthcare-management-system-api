import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });
dotenv.config({ path: '.env.development.local' });

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  
  // Set NODE_ENV to test
  process.env.NODE_ENV = 'test';
  
  // Override database URL for testing if needed
  if (!process.env.TEST_DATABASE_URI && process.env.DATABASE_URI) {
    process.env.TEST_DATABASE_URI = process.env.DATABASE_URI;
  }
});

afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Clean up any global resources
  // Close database connections, etc.
});

beforeEach(async () => {
  // Reset any global state before each test
});

afterEach(async () => {
  // Clean up after each test
});

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock user for authentication tests
  mockUser: {
    userId: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'patient'
  },
  
  // Mock doctor for doctor-specific tests
  mockDoctor: {
    userId: 'test-doctor-id',
    email: 'doctor@example.com',
    firstName: 'Dr. Test',
    lastName: 'Doctor',
    role: 'doctor'
  },
  
  // Mock admin for admin-specific tests
  mockAdmin: {
    userId: 'test-admin-id',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  }
};
