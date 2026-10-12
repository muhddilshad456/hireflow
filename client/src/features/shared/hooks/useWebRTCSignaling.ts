import { useEffect } from "react";
import type { Socket } from "socket.io-client";

interface UseWebRTCSignalingProps {
  socket: Socket | null;
  interviewId: string;
  peerConnection: RTCPeerConnection | null;
  isOffer: boolean;
}

export const useWebRTCSignaling = ({
  socket,
  interviewId,
  peerConnection,
  isOffer,
}: UseWebRTCSignalingProps) => {
  useEffect(() => {
    if (!socket || !interviewId || !peerConnection) {
      return;
    }

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        );

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        socket.emit("interview:answer", {
          interviewId,
          answer,
        });
      } catch (error) {
        console.error("Failed to handle offer:", error);
      }
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      } catch (error) {
        console.error("Failed to handle answer:", error);
      }
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Failed to add ICE candidate:", error);
      }
    };

    const handlePeerJoined = async () => {
      if (!isOffer) return;
      try {
        const offer = await peerConnection.createOffer();

        await peerConnection.setLocalDescription(offer);

        socket.emit("interview:offer", {
          interviewId,
          offer,
        });
      } catch (error) {
        console.error("Failed to create offer:", error);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate) return;

      socket.emit("interview:ice-candidate", {
        interviewId,
        candidate: event.candidate,
      });
    };

    socket.on("interview:peer-joined", handlePeerJoined);
    socket.on("interview:offer", handleOffer);
    socket.on("interview:answer", handleAnswer);
    socket.on("interview:ice-candidate", handleIceCandidate);

    socket.emit("interview:join", {
      interviewId,
    });

    return () => {
      socket.off("interview:peer-joined", handlePeerJoined);
      socket.off("interview:offer", handleOffer);
      socket.off("interview:answer", handleAnswer);
      socket.off("interview:ice-candidate", handleIceCandidate);

      peerConnection.onicecandidate = null;
    };
  }, [socket, interviewId, peerConnection]);
};
