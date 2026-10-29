import { userRoom } from "../../constants/notification/notification";
import type { AuthedSocket } from "../../socket/middleware/socketAuth";

export function initNotificationSocket(socket: AuthedSocket) {
  const userId = socket.user?.id;
  if (!userId) return;

  socket.join(userRoom(userId));
}
