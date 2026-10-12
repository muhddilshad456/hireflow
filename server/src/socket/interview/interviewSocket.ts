import { Types } from "mongoose";
import { Server } from "socket.io";
import { container } from "../../dependency-injection/container";
import { TYPES } from "../../dependency-injection/types";
import { IInterviewService } from "../../services/v1/interview/interface/IInterviewService";
import { AuthedSocket } from "../middleware/socketAuth";

const roomOf = (interviewId: string) => `interview:${interviewId}`;

export function initInterviewSocket(io: Server, socket: AuthedSocket) {
  const interviewService = container.get<IInterviewService>(
    TYPES.InterviewService,
  );

  /**
   * Join interview room
   * Client sends: { interviewId }
   */
  socket.on(
    "interview:join",
    async ({ interviewId }: { interviewId: string }) => {
      try {
        if (!socket.user?.id) {
          return socket.emit("interview:error", { message: "Unauthorized" });
        }

        if (!Types.ObjectId.isValid(interviewId)) {
          return socket.emit("interview:error", {
            message: "Invalid interview ID",
          });
        }

        const allowed = await interviewService.isParticipant(
          new Types.ObjectId(interviewId),
          new Types.ObjectId(socket.user.id),
        );

        if (!allowed) {
          return socket.emit("interview:error", {
            message: "You are not allowed to join this interview",
          });
        }

        const room = roomOf(interviewId);
        socket.join(room);
        console.log(`User ${socket.user.id} joined ${room}`);

        socket.emit("interview:joined", { interviewId });

        // If someone is already waiting, tell everyone in the room.
        // Only the interviewer's page (isOffer: true) reacts by creating the offer,
        // so this works whichever person joined first.
        const size = io.sockets.adapter.rooms.get(room)?.size ?? 0;
        if (size > 1) {
          io.to(room).emit("interview:peer-joined");
        }
      } catch (error: any) {
        console.error("Interview join error:", error);
        socket.emit("interview:error", { message: error.message });
      }
    },
  );

  /**
   * Leave interview room
   */
  socket.on("interview:leave", ({ interviewId }: { interviewId: string }) => {
    socket.leave(roomOf(interviewId));
    console.log(`User ${socket.user?.id} left ${roomOf(interviewId)}`);
  });

  /**
   * WebRTC signaling: forward the RAW payload (what the client hooks expect)
   */
  socket.on(
    "interview:offer",
    ({
      interviewId,
      offer,
    }: {
      interviewId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      const room = roomOf(interviewId);
      if (!socket.rooms.has(room)) return;
      socket.to(room).emit("interview:offer", offer);
    },
  );

  socket.on(
    "interview:answer",
    ({
      interviewId,
      answer,
    }: {
      interviewId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      const room = roomOf(interviewId);
      if (!socket.rooms.has(room)) return;
      socket.to(room).emit("interview:answer", answer);
    },
  );

  socket.on(
    "interview:ice-candidate",
    ({
      interviewId,
      candidate,
    }: {
      interviewId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      const room = roomOf(interviewId);
      if (!socket.rooms.has(room)) return;
      socket.to(room).emit("interview:ice-candidate", candidate);
    },
  );

  /**
   * Mic / camera state, so the other side can show the "initial" circle
   */
  socket.on(
    "interview:media-state",
    ({
      interviewId,
      audio,
      video,
    }: {
      interviewId: string;
      audio: boolean;
      video: boolean;
    }) => {
      const room = roomOf(interviewId);
      if (!socket.rooms.has(room)) return;
      socket.to(room).emit("interview:media-state", { audio, video });
    },
  );

  /**
   * End call: shows "Interview ended" on the other side
   */
  socket.on("interview:end", ({ interviewId }: { interviewId: string }) => {
    const room = roomOf(interviewId);
    if (!socket.rooms.has(room)) return;
    socket.to(room).emit("interview:end");
  });
}
