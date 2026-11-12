import {
  APPLICATION_EVENTS,
  ApplicationUpdatedPayload,
} from "../../constants/application/application";
import { userRoom } from "../../constants/notification/notification";
import { getIO } from "../Socketserver";

export const emitApplicationUpdated = (
  userIds: string[],
  payload: ApplicationUpdatedPayload,
): void => {
  try {
    const io = getIO();
    if (!io) return;

    [...new Set(userIds)].forEach((userId) => {
      io.to(userRoom(userId)).emit(APPLICATION_EVENTS.UPDATED, payload);
    });
  } catch (error) {
    console.error("emitApplicationUpdated failed:", error);
  }
};
