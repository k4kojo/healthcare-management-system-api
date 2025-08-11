import { Router } from "express";
import {
  createVideoCall,
  endVideoCall,
  handleWebhook,
  joinVideoCall,
} from "../controllers/videoCalls.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { verifyVideoCallAccess } from "../middlewares/videoCall/verifyAccess.middleware.js";
import { createVideoCallSchema } from "../validators/videoCallsSchema.js";

const videoCallRouter = Router();

videoCallRouter.post(
  "/",
  authenticateToken,
  validateRequest(createVideoCallSchema),
  createVideoCall
);

videoCallRouter.post(
  "/:callId/join",
  authenticateToken,
  verifyVideoCallAccess,
  joinVideoCall
);

videoCallRouter.post(
  "/:callId/end",
  authenticateToken,
  verifyVideoCallAccess,
  endVideoCall
);

// Twilio webhook endpoint (no authentication)
videoCallRouter.post(
  "/webhook",
  express.urlencoded({ extended: false }),
  handleWebhook
);

export default videoCallRouter;
