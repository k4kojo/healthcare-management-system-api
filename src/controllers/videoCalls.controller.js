import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { chatRooms, videoCalls } from "../db/schema.js";
import { createWebRTCRoom, endWebRTCRoom, getRoomInfo } from "../services/webrtcVideo.js";

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

    // Create WebRTC room
    const webrtcRoom = await createWebRTCRoom(chatRoomId, userId);

    // Create video call record
    const [newCall] = await db
      .insert(videoCalls)
      .values({
        chatRoomId,
        appointmentId,
        patientId: chatRoom.patientId,
        doctorId: chatRoom.doctorId,
        roomSid: webrtcRoom.roomSid,
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
      roomId: webrtcRoom.roomId,
      roomName: webrtcRoom.roomName,
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

    // Get room information
    const roomInfo = await getRoomInfo(call.roomSid);

    res.status(200).json({
      roomId: call.roomSid,
      roomInfo: roomInfo,
      userId: userId,
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

    // End WebRTC room
    await endWebRTCRoom(call.roomSid);

    // Update call status in database
    await db
      .update(videoCalls)
      .set({
        status: "completed",
        endedAt: new Date(),
      })
      .where(eq(videoCalls.id, callId));

    // Update chat room to remove active call
    await db
      .update(chatRooms)
      .set({ hasActiveCall: false, currentCallId: null })
      .where(eq(chatRooms.chatRoomId, call.chatRoomId));

    res.status(200).json({ message: "Call ended successfully" });
  } catch (error) {
    console.error("Error ending video call:", error);
    res.status(500).json({ error: "Failed to end video call" });
  }
};

// WebRTC status handler (replaces webhook)
export const updateCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    const { status, duration } = req.body;
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
      return res.status(403).json({ error: "Not authorized to update this call" });
    }

    const updateData = { status };
    
    if (status === "in-progress" && !call.startedAt) {
      updateData.startedAt = new Date();
    } else if (status === "completed") {
      updateData.endedAt = new Date();
      if (duration) {
        updateData.duration = duration;
      }
    }

    await db
      .update(videoCalls)
      .set(updateData)
      .where(eq(videoCalls.id, callId));

    res.status(200).json({ message: "Call status updated successfully" });
  } catch (error) {
    console.error("Error updating call status:", error);
    res.status(500).json({ error: "Failed to update call status" });
  }
};
