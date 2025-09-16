# USSD Integration for MediConnect

## Overview
This document describes the USSD (Unstructured Supplementary Service Data) integration for MediConnect, enabling patients to book appointments without internet connectivity using basic mobile phones.

## Features
- **Appointment Booking**: Book appointments with available doctors
- **View Appointments**: Check existing appointments
- **Cancel Appointments**: Cancel pending appointments
- **SMS Confirmations**: Receive SMS notifications for bookings
- **Multi-language Support**: Ready for localization

## USSD Menu Flow

### Main Menu
```
CON Welcome to MediConnect
1. Book Appointment
2. View My Appointments
3. Cancel Appointment
4. Contact Support
```

### Appointment Booking Flow
1. **Patient Verification**: Verify patient exists in system using phone number
2. **Doctor Selection**: Choose from available doctors with specializations
3. **Date Selection**: Pick from next 7 available days
4. **Time Selection**: Choose from available time slots
5. **Confirmation**: Confirm booking and receive SMS confirmation

### Example USSD Session
```
User dials: *123*456#

Step 1: Main Menu
CON Welcome to MediConnect
1. Book Appointment
2. View My Appointments
3. Cancel Appointment
4. Contact Support

User enters: 1

Step 2: Doctor Selection
CON Select a doctor:
1. Dr. John Smith - Cardiology
2. Dr. Jane Doe - General Practice
3. Dr. Mike Johnson - Pediatrics

User enters: 2

Step 3: Date Selection
CON Select appointment date:
1. 17/09/2025
2. 18/09/2025
3. 19/09/2025
4. 20/09/2025

User enters: 1

Step 4: Time Selection
CON Select appointment time:
1. 09:00 AM
2. 10:00 AM
3. 11:00 AM
4. 02:00 PM

User enters: 2

Step 5: Confirmation
END Appointment booked successfully!
Doctor: Dr. Jane Doe
Date: 17/09/2025
Time: 10:00 AM
Ref: a1b2c3d4
You will receive an SMS confirmation.
```

## Technical Implementation

### Architecture
- **USSD Service**: `src/services/ussdService.js` - Core USSD logic
- **USSD Controller**: `src/controllers/ussd.controller.js` - HTTP request handling
- **USSD Routes**: `src/routes/ussd.route.js` - API endpoints
- **Session Management**: In-memory storage (Redis recommended for production)

### Key Components

#### USSDService Class
- `handleUSSDRequest()`: Main request handler
- `showMainMenu()`: Display main menu
- `handleMainMenuSelection()`: Process menu selections
- `confirmBooking()`: Create appointment and send SMS
- `sendSMSConfirmation()`: Send SMS notifications

#### Database Integration
- Uses existing appointment schema
- Integrates with user authentication system
- Supports doctor profiles and specializations

### API Endpoints
- `POST /api/v0/ussd/` - Main USSD webhook
- `POST /api/v0/ussd/callback` - Callback handler
- `GET /api/v0/ussd/health` - Health check

## Setup Instructions

### 1. Africa's Talking Account Setup
1. Create an account at [Africa's Talking](https://africastalking.com)
2. Get your API key and username
3. Purchase a USSD short code
4. Configure webhook URL

### 2. Environment Variables
Add to your `.env` file:
```env
AFRICASTALKING_API_KEY="your-api-key"
AFRICASTALKING_USERNAME="your-username"
AFRICASTALKING_SHORTCODE="MediConnect"
USSD_SERVICE_CODE="*123*456#"
USSD_WEBHOOK_URL="https://yourdomain.com/api/v0/ussd"
```

### 3. Webhook Configuration
Configure Africa's Talking to send USSD requests to:
```
https://yourdomain.com/api/v0/ussd
```

### 4. Dependencies
Install required packages:
```bash
npm install africastalking axios
```

## Session Management

### Current Implementation
- In-memory storage using JavaScript Map
- Session data includes: flow state, user selections, temporary data
- Sessions are cleared after completion or timeout

### Production Recommendations
- Use Redis for session storage
- Implement session timeout (5-10 minutes)
- Add session cleanup jobs
- Consider database persistence for critical flows

## Error Handling

### Common Scenarios
- **Unregistered User**: "You are not registered. Please register through the mobile app first."
- **Invalid Selection**: Return to previous menu with error message
- **Database Error**: "Sorry, an error occurred. Please try again later."
- **Network Issues**: Automatic retry with fallback messages

### Logging
All USSD requests and responses are logged for debugging:
```javascript
console.log('USSD Request:', { sessionId, serviceCode, phoneNumber, text });
console.log('USSD Response:', result);
```

## SMS Integration

### Confirmation Messages
```
MediConnect: Your appointment is confirmed!
Doctor: Dr. Jane Doe
Date: 17/09/2025 10:00 AM
Reference: a1b2c3d4
Please arrive 15 minutes early.
```

### SMS Configuration
Uses Africa's Talking SMS service with the same credentials as USSD.

## Security Considerations

### Input Validation
- Validate all user inputs
- Sanitize phone numbers
- Check session integrity
- Prevent injection attacks

### Rate Limiting
- Implement per-phone-number rate limiting
- Monitor for suspicious patterns
- Add CAPTCHA for repeated failures

### Data Privacy
- Don't store sensitive data in sessions
- Log minimal required information
- Comply with local data protection laws

## Testing

### Manual Testing
1. Use Africa's Talking simulator
2. Test with real mobile devices
3. Verify SMS delivery
4. Check database records

### Automated Testing
```javascript
// Example test case
describe('USSD Service', () => {
  it('should show main menu on empty input', async () => {
    const result = await ussdService.handleUSSDRequest('session1', '+233123456789', '');
    expect(result.response).toContain('Welcome to MediConnect');
  });
});
```

## Monitoring and Analytics

### Key Metrics
- USSD session completion rates
- Most popular booking times
- Error rates by flow step
- SMS delivery success rates

### Recommended Tools
- Application logs
- Database query monitoring
- Africa's Talking dashboard
- Custom analytics dashboard

## Troubleshooting

### Common Issues

#### USSD Not Working
1. Check webhook URL configuration
2. Verify API credentials
3. Check server accessibility
4. Review firewall settings

#### SMS Not Sending
1. Verify SMS balance
2. Check phone number format
3. Review SMS content length
4. Check sender ID approval

#### Database Errors
1. Check database connectivity
2. Verify schema compatibility
3. Review query performance
4. Check transaction handling

### Debug Mode
Enable detailed logging:
```javascript
// In ussdService.js
const DEBUG_MODE = process.env.NODE_ENV === 'development';
if (DEBUG_MODE) {
  console.log('Session state:', session);
}
```

## Future Enhancements

### Planned Features
- Multi-language support (English, French, Local languages)
- Payment integration via mobile money
- Prescription refill requests
- Lab result notifications
- Doctor availability real-time updates

### Technical Improvements
- Redis session storage
- Webhook signature verification
- Advanced analytics
- Load balancing support
- Caching layer for doctor data

## Support

### Documentation
- API documentation: `/docs/api`
- Database schema: `/docs/database`
- Deployment guide: `/docs/deployment`

### Contact
- Technical issues: tech@mediconnect.com
- USSD setup: ussd@mediconnect.com
- General support: support@mediconnect.com

---

**Last Updated**: September 16, 2025
**Version**: 1.0.0
