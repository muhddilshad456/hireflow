import { useCallback, useEffect, useRef, useState } from "react";

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      return stream;
    } catch (error) {
      console.error("Failed to access camera/microphone:", error);

      throw error;
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peerConnectionRef.current = peerConnection;

    return peerConnection;
  }, []);

  const addLocalTracks = useCallback((stream: MediaStream) => {
    const peerConnection = peerConnectionRef.current;

    if (!peerConnection) return;

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
  }, []);

  const setupRemoteStream = useCallback(() => {
    const peerConnection = peerConnectionRef.current;

    if (!peerConnection) return;

    peerConnection.ontrack = (event) => {
      const [stream] = event.streams;

      if (stream) {
        setRemoteStream(stream);
      }
    };
  }, []);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());

    peerConnectionRef.current?.close();

    localStreamRef.current = null;
    peerConnectionRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    localStream,
    remoteStream,
    startLocalStream,
    createPeerConnection,
    addLocalTracks,
    setupRemoteStream,
    cleanup,
  };
};
