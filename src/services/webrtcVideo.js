import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { chatRooms, videoCalls } from "../db/schema.js";
import { v4 as uuidv4 } from "uuid";

// In-memory storage for active WebRTC rooms
const activeRooms = new Map();

export const createWebRTCRoom = async (chatRoomId, userId) => {
  try {
    const roomId = `room_${chatRoomId}_${Date.now()}`;
    const roomName = `WebRTC Room ${chatRoomId}`;

    // Create room in memory
    const room = {
      id: roomId,
      name: roomName,
      chatRoomId,
      createdBy: userId,
      participants: new Map(),
      createdAt: new Date(),
      status: 'created'
    };

    activeRooms.set(roomId, room);

    return {
      roomSid: roomId,
      roomName: roomName,
      roomId: roomId,
    };
  } catch (error) {
    console.error("WebRTC room creation failed:", error);
    throw error;
  }
};

export const joinWebRTCRoom = async (roomId, userId) => {
  try {
    const room = activeRooms.get(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Add participant to room
    room.participants.set(userId, {
      userId,
      joinedAt: new Date(),
      status: 'connected'
    });

    return {
      roomId,
      participants: Array.from(room.participants.keys())
    };
  } catch (error) {
    console.error("WebRTC room join failed:", error);
    throw error;
  }
};

export const leaveWebRTCRoom = async (roomId, userId) => {
  try {
    const room = activeRooms.get(roomId);
    if (room && room.participants.has(userId)) {
      room.participants.delete(userId);
      
      // If no participants left, mark room as ended
      if (room.participants.size === 0) {
        room.status = 'ended';
        room.endedAt = new Date();
      }
    }

    return true;
  } catch (error) {
    console.error("WebRTC room leave failed:", error);
    throw error;
  }
};

export const endWebRTCRoom = async (roomId) => {
  try {
    const room = activeRooms.get(roomId);
    if (room) {
      room.status = 'ended';
      room.endedAt = new Date();
      room.participants.clear();
    }
    return true;
  } catch (error) {
    console.error("WebRTC room end failed:", error);
    throw error;
  }
};

export const getRoomInfo = async (roomId) => {
  try {
    const room = activeRooms.get(roomId);
    if (!room) {
      return null;
    }

    return {
      id: room.id,
      name: room.name,
      status: room.status,
      participantCount: room.participants.size,
      participants: Array.from(room.participants.keys()),
      createdAt: room.createdAt,
      endedAt: room.endedAt
    };
  } catch (error) {
    console.error("Error getting room info:", error);
    throw error;
  }
};

// WebSocket event handlers for signaling
export const handleWebRTCSignaling = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', async (data) => {
      const { roomId, userId } = data;
      try {
        await joinWebRTCRoom(roomId, userId);
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
        
        // Send existing participants to new user
        const room = activeRooms.get(roomId);
        if (room) {
          const participants = Array.from(room.participants.keys()).filter(id => id !== userId);
          socket.emit('existing-participants', { participants });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('offer', (data) => {
      socket.to(data.target).emit('offer', {
        offer: data.offer,
        sender: socket.id
      });
    });

    socket.on('answer', (data) => {
      socket.to(data.target).emit('answer', {
        answer: data.answer,
        sender: socket.id
      });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.target).emit('ice-candidate', {
        candidate: data.candidate,
        sender: socket.id
      });
    });

    socket.on('leave-room', async (data) => {
      const { roomId, userId } = data;
      try {
        await leaveWebRTCRoom(roomId, userId);
        socket.leave(roomId);
        socket.to(roomId).emit('user-left', { userId, socketId: socket.id });
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Handle cleanup if needed
    });
  });
};
