import type { Server } from "socket.io";

let ioInstance: Server | null = null;

export const setIO = (io: Server): void => {
  ioInstance = io;
};

export const getIO = (): Server | null => ioInstance;
