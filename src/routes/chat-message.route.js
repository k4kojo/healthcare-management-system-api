import { Router } from "express";
import {
  createChatMessages,
  deleteChatMessages,
  getAllChatMessages,
  getChatMessagesById,
  updateChatMessages,
} from "../controllers/chatMessages.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateChatMessageFKs } from "../middlewares/chat/fkValidation.middleware.js";
import { verifyMessageOwnership } from "../middlewares/chat/ownership.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  chatMessageSchema,
  chatMessageUpdateSchema,
} from "../validators/chatMessageSchema.js";

const chatMessagesRouter = Router();

// Apply authentication to all routes
chatMessagesRouter.use(authenticateToken);

chatMessagesRouter.get(
  "/",
  authorizeRoles(["admin", "doctor"]),
  getAllChatMessages
);

chatMessagesRouter.get("/:id", verifyMessageOwnership, getChatMessagesById);

chatMessagesRouter.post(
  "/",
  validateRequest(chatMessageSchema),
  validateChatMessageFKs,
  createChatMessages
);

chatMessagesRouter.put(
  "/:id",
  verifyMessageOwnership,
  validateRequest(chatMessageUpdateSchema),
  updateChatMessages
);

chatMessagesRouter.delete(
  "/:id",
  authorizeRoles(["admin"]),
  verifyMessageOwnership,
  deleteChatMessages
);

export default chatMessagesRouter;
