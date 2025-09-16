import axios from 'axios';

const BASE_URL = 'http://localhost:5500/api/v0/ussd';

// Test USSD endpoints
async function testUSSDEndpoints() {
  console.log('🧪 Testing USSD Integration...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // Test 2: Main Menu (empty text)
    console.log('2. Testing main menu...');
    const mainMenuResponse = await axios.post(BASE_URL, {
      sessionId: 'test-session-1',
      serviceCode: '*123*456#',
      phoneNumber: '+233123456789',
      text: ''
    });
    console.log('✅ Main menu response:');
    console.log(mainMenuResponse.data);
    console.log('');

    // Test 3: Book Appointment Selection
    console.log('3. Testing appointment booking selection...');
    const bookingResponse = await axios.post(BASE_URL, {
      sessionId: 'test-session-2',
      serviceCode: '*123*456#',
      phoneNumber: '+233123456789',
      text: '1'
    });
    console.log('✅ Booking selection response:');
    console.log(bookingResponse.data);
    console.log('');

    // Test 4: Invalid Selection
    console.log('4. Testing invalid selection...');
    const invalidResponse = await axios.post(BASE_URL, {
      sessionId: 'test-session-3',
      serviceCode: '*123*456#',
      phoneNumber: '+233123456789',
      text: '9'
    });
    console.log('✅ Invalid selection response:');
    console.log(invalidResponse.data);
    console.log('');

    console.log('🎉 All USSD tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testUSSDEndpoints();
