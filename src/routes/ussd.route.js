import { Router } from 'express';
import { 
  handleUSSDRequest, 
  handleUSSDCallback, 
  ussdHealthCheck 
} from '../controllers/ussd.controller.js';

const ussdRouter = Router();

// Main USSD endpoint - this is where Africa's Talking will send requests
ussdRouter.post('/', handleUSSDRequest);

// Callback endpoint for any additional notifications
ussdRouter.post('/callback', handleUSSDCallback);

// Health check endpoint
ussdRouter.get('/health', ussdHealthCheck);

export default ussdRouter;
