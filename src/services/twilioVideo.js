import Twilio from "twilio";
import { db } from "../config/db.js";
import { chatRooms, videoCalls } from "../db/schema/index.js";

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const createTwilioRoom = async (chatRoomId, userId) => {
  try {
    // Create Twilio room
    const room = await twilioClient.video.rooms.create({
      uniqueName: `room_${chatRoomId}_${Date.now()}`,
      type: "group",
      recordParticipantsOnConnect: true,
      statusCallback: `${process.env.API_BASE_URL}/video-calls/webhook`,
    });

    // Generate access token for the user
    const token = new Twilio.jwt.AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { identity: userId }
    );

    const videoGrant = new Twilio.jwt.AccessToken.VideoGrant({
      room: room.sid,
    });
    token.addGrant(videoGrant);

    return {
      roomSid: room.sid,
      roomName: room.uniqueName,
      accessToken: token.toJwt(),
    };
  } catch (error) {
    console.error("Twilio room creation failed:", error);
    throw error;
  }
};

export const endTwilioRoom = async (roomSid) => {
  try {
    await twilioClient.video.rooms(roomSid).update({ status: "completed" });
    return true;
  } catch (error) {
    console.error("Twilio room end failed:", error);
    throw error;
  }
};

export const handleTwilioWebhook = async (req, res) => {
  const { RoomSid, RoomStatus, RoomName, StatusCallbackEvent } = req.body;

  try {
    // Find the call in our database
    const call = await db.query.videoCalls.findFirst({
      where: eq(videoCalls.roomSid, RoomSid),
    });

    if (!call) {
      return res.status(404).send("Call not found");
    }

    // Update call status based on Twilio events
    let updateData = {};

    switch (StatusCallbackEvent) {
      case "room-started":
        updateData.status = "in-progress";
        updateData.startedAt = new Date();
        break;
      case "room-ended":
        updateData.status = "completed";
        updateData.endedAt = new Date();
        if (call.startedAt) {
          updateData.duration = Math.floor(
            (new Date() - call.startedAt) / 1000
          );
        }
        // Update chat room to remove active call
        await db
          .update(chatRooms)
          .set({ hasActiveCall: false, currentCallId: null })
          .where(eq(chatRooms.chatRoomId, call.chatRoomId));
        break;
      case "participant-connected":
      case "participant-disconnected":
        // Update participants list
        const room = await twilioClient.video.rooms(RoomSid).fetch();
        const participants = await room.participants().list();
        updateData.participants = JSON.stringify(
          participants.map((p) => ({
            sid: p.sid,
            identity: p.identity,
            status: p.status,
          }))
        );
        break;
      case "recording-completed":
        updateData.recordingAvailable = true;
        updateData.recordingUrl = req.body.RecordingUrl;
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(videoCalls)
        .set(updateData)
        .where(eq(videoCalls.id, call.id));
    }

    res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    res.status(500).send("Error processing webhook");
  }
};
