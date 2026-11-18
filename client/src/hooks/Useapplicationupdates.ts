import { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";

export interface ApplicationUpdatedPayload {
  applicationId: string;
  applicationStageId?: string;
  jobId: string;
  reason: string;
}

interface UseApplicationUpdatesOptions {
  onUpdate: (payload: ApplicationUpdatedPayload) => void;
  match?: (payload: ApplicationUpdatedPayload) => boolean;
  onReconnect?: () => void;
}

export const useApplicationUpdates = ({
  onUpdate,
  match,
  onReconnect,
}: UseApplicationUpdatesOptions) => {
  const socket = useSocket();
  const onUpdateRef = useRef(onUpdate);
  const matchRef = useRef(match);
  const onReconnectRef = useRef(onReconnect);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    matchRef.current = match;
    onReconnectRef.current = onReconnect;
  });

  const hasConnectedBefore = useRef(false);

  useEffect(() => {
    if (!socket) return;

    if (hasConnectedBefore.current) onReconnectRef.current?.();
    hasConnectedBefore.current = true;

    const handler = (payload: ApplicationUpdatedPayload) => {
      console.log("coming payload : ", payload);
      if (!matchRef.current || matchRef.current(payload)) {
        onUpdateRef.current(payload);
      }
    };

    socket.on("application:updated", handler);
    return () => {
      socket.off("application:updated", handler);
    };
  }, [socket]);
};
