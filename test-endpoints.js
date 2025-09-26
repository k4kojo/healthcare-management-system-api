import axios from 'axios';

// Try common ports
const POSSIBLE_PORTS = [3000, 5000, 8000, 8080, 4000];
let BASE_URL = null;

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '+1234567890',
  dateOfBirth: '1990-01-01',
  role: 'patient'
};

let authToken = null;

async function findServerPort() {
  for (const port of POSSIBLE_PORTS) {
    try {
      const testUrl = `http://localhost:${port}`;
      const response = await axios.get(testUrl, { timeout: 2000 });
      if (response.status === 200) {
        BASE_URL = testUrl;
        console.log(`✅ Found server running on port ${port}`);
        return true;
      }
    } catch (error) {
      // Continue to next port
    }
  }
  return false;
}

async function testEndpoint(method, url, data = null, headers = {}) {
  if (!BASE_URL) {
    console.log('❌ No server found');
    return null;
  }
  
  try {
    const config = {
      method,
      url: `${BASE_URL}/api/v0${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${url} - Status: ${response.status}`);
    return response.data;
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const message = error.response?.data?.message || error.message;
    console.log(`❌ ${method} ${url} - Status: ${status}, Message: ${message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting MediConnect API Tests...\n');
  
  // Test 1: Find Server
  console.log('1. Finding Server...');
  const serverFound = await findServerPort();
  if (!serverFound) {
    console.log('❌ No server found on common ports. Please start the server first.');
    return;
  }
  
  // Test 2: User Registration
  console.log('\n2. Testing User Registration...');
  await testEndpoint('POST', '/user/sign-up', testUser);
  
  // Test 3: User Login
  console.log('\n3. Testing User Login...');
  const loginResult = await testEndpoint('POST', '/user/sign-in', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (loginResult && loginResult.token) {
    authToken = loginResult.token;
    console.log('✅ Authentication token obtained');
  }
  
  // Test 4: Protected Endpoints (with auth)
  if (authToken) {
    console.log('\n4. Testing Protected Endpoints...');
    const authHeaders = { 'Authorization': `Bearer ${authToken}` };
    
    await testEndpoint('GET', '/appointments', null, authHeaders);
    await testEndpoint('GET', '/medications/current', null, authHeaders);
    await testEndpoint('GET', '/prescriptions/patient', null, authHeaders);
    await testEndpoint('GET', '/consultations', null, authHeaders);
    await testEndpoint('GET', '/lab-results', null, authHeaders);
    await testEndpoint('GET', '/medical-records', null, authHeaders);
    await testEndpoint('GET', '/notifications', null, authHeaders);
    await testEndpoint('GET', '/doctor-profiles', null, authHeaders);
    await testEndpoint('GET', '/video-calls', null, authHeaders);
  }
  
  // Test 5: Unauthorized Access
  console.log('\n5. Testing Unauthorized Access...');
  await testEndpoint('GET', '/user/');
  await testEndpoint('GET', '/appointments');
  
  // Test 6: Invalid Endpoints
  console.log('\n6. Testing Invalid Endpoints...');
  await testEndpoint('GET', '/invalid-endpoint');
  await testEndpoint('GET', '/user/invalid');
  
  console.log('\n🎉 API Tests Completed!');
}

// Run the tests
runTests().catch(console.error);
