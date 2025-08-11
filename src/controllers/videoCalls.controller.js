import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { chatRooms, videoCalls } from "../db/schema/index.js";
import { createTwilioRoom, endTwilioRoom } from "../services/twilioVideo.js";

export const createVideoCall = async (req, res) => {
  try {
    const { chatRoomId, appointmentId } = req.body;
    const userId = req.user.userId;

    // Verify chat room and user access
    const chatRoom = await db.query.chatRooms.findFirst({
      where: (rooms, { eq, and, or }) =>
        and(
          eq(rooms.chatRoomId, chatRoomId),
          or(eq(rooms.patientId, userId), eq(rooms.doctorId, userId))
        ),
    });

    if (!chatRoom) {
      return res
        .status(403)
        .json({ error: "Not authorized for this chat room" });
    }

    // Check for existing active call
    if (chatRoom.hasActiveCall) {
      return res
        .status(400)
        .json({ error: "This chat room already has an active call" });
    }

    // Create Twilio room
    const twilioRoom = await createTwilioRoom(chatRoomId, userId);

    // Create video call record
    const [newCall] = await db
      .insert(videoCalls)
      .values({
        chatRoomId,
        appointmentId,
        patientId: chatRoom.patientId,
        doctorId: chatRoom.doctorId,
        roomSid: twilioRoom.roomSid,
        statusCallbackUrl: `${process.env.API_BASE_URL}/video-calls/webhook`,
        status: "scheduled",
      })
      .returning();

    // Update chat room
    await db
      .update(chatRooms)
      .set({
        hasActiveCall: true,
        currentCallId: newCall.id,
      })
      .where(eq(chatRooms.chatRoomId, chatRoomId));

    res.status(201).json({
      ...newCall,
      accessToken: twilioRoom.accessToken,
      roomName: twilioRoom.roomName,
    });
  } catch (error) {
    console.error("Error creating video call:", error);
    res.status(500).json({ error: "Failed to create video call" });
  }
};

export const joinVideoCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.userId;

    // Verify call exists and user is a participant
    const call = await db.query.videoCalls.findFirst({
      where: (calls, { eq, and, or }) =>
        and(
          eq(calls.id, callId),
          or(eq(calls.patientId, userId), eq(calls.doctorId, userId))
        ),
    });

    if (!call) {
      return res
        .status(403)
        .json({ error: "Not authorized to join this call" });
    }

    // Generate Twilio token for the user
    const token = new Twilio.jwt.AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { identity: userId }
    );

    const videoGrant = new Twilio.jwt.AccessToken.VideoGrant({
      room: call.roomSid,
    });
    token.addGrant(videoGrant);

    res.status(200).json({
      accessToken: token.toJwt(),
      roomSid: call.roomSid,
    });
  } catch (error) {
    console.error("Error joining video call:", error);
    res.status(500).json({ error: "Failed to join video call" });
  }
};

export const endVideoCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.userId;

    // Verify call exists and user is a participant
    const call = await db.query.videoCalls.findFirst({
      where: (calls, { eq, and, or }) =>
        and(
          eq(calls.id, callId),
          or(eq(calls.patientId, userId), eq(calls.doctorId, userId))
        ),
    });

    if (!call) {
      return res.status(403).json({ error: "Not authorized to end this call" });
    }

    // End Twilio room
    await endTwilioRoom(call.roomSid);

    // Note: The actual status update will happen via webhook when Twilio confirms
    res.status(200).json({ message: "Call ending initiated" });
  } catch (error) {
    console.error("Error ending video call:", error);
    res.status(500).json({ error: "Failed to end video call" });
  }
};

// Webhook handler
export const handleWebhook = async (req, res) => {
  try {
    await handleTwilioWebhook(req, res);
  } catch (error) {
    console.error("Error in webhook handler:", error);
    res.status(500).send("Error processing webhook");
  }
};
