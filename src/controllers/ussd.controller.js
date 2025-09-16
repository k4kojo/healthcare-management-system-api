import ussdService from '../services/ussdService.js';

export const handleUSSDRequest = async (req, res) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    
    console.log('USSD Request:', { sessionId, serviceCode, phoneNumber, text });
    
    // Validate required fields
    if (!sessionId || !phoneNumber) {
      return res.status(400).send('END Invalid request parameters');
    }

    // Handle the USSD request through the service
    const result = await ussdService.handleUSSDRequest(sessionId, phoneNumber, text || '');
    
    console.log('USSD Response:', result);
    
    // Return the response in the format expected by Africa's Talking
    res.set('Content-Type', 'text/plain');
    res.send(result.response);
    
    // Clear session if the flow is complete
    if (!result.continue) {
      ussdService.clearSession(sessionId);
    }
    
  } catch (error) {
    console.error('USSD Controller Error:', error);
    res.set('Content-Type', 'text/plain');
    res.send('END Sorry, an error occurred. Please try again later.');
  }
};

export const handleUSSDCallback = async (req, res) => {
  try {
    // Handle any callback from Africa's Talking if needed
    console.log('USSD Callback:', req.body);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('USSD Callback Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Health check endpoint for USSD service
export const ussdHealthCheck = async (req, res) => {
  try {
    res.json({ 
      status: 'active',
      service: 'USSD MediConnect',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('USSD Health Check Error:', error);
    res.status(500).json({ error: 'Service unavailable' });
  }
};
