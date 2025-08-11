import { Router } from "express";
import {
  createChatRooms,
  deleteChatRooms,
  getAllChatRooms,
  getChatRoomsById,
  updateChatRooms,
} from "../controllers/chatRooms.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateRoomAccess } from "../middlewares/chat/roomAccess.middleware.js";
import { verifyRoomOwnership } from "../middlewares/chat/roomOwnership.middleware.js";
import { validateRoomParticipants } from "../middlewares/chat/roomParticipants.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  chatRoomSchema,
  chatRoomUpdateSchema,
} from "../validators/chatRoomSchema.js";

const chatRoomsRouter = Router();

// Apply authentication to all routes
chatRoomsRouter.use(authenticateToken);

chatRoomsRouter.get(
  "/",
  validateRoomAccess(["admin", "doctor", "patient"]),
  getAllChatRooms
);

chatRoomsRouter.get("/:id", verifyRoomOwnership, getChatRoomsById);

chatRoomsRouter.post(
  "/",
  validateRoomAccess(["admin", "doctor"]),
  validateRequest(chatRoomSchema),
  validateRoomParticipants,
  createChatRooms
);

chatRoomsRouter.put(
  "/:id",
  verifyRoomOwnership,
  validateRoomAccess(["admin", "doctor"]),
  validateRequest(chatRoomUpdateSchema),
  updateChatRooms
);

chatRoomsRouter.delete(
  "/:id",
  validateRoomAccess(["admin"]),
  verifyRoomOwnership,
  deleteChatRooms
);

export default chatRoomsRouter;
