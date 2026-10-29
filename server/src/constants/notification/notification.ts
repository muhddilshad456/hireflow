export const NOTIFICATION_TTL_DAYS = 30; // notifications auto-delete after this many days
export const NOTIFICATION_PAGE_SIZE_MAX = 50;

// Each user has a private socket room, so a notification only reaches that user
export const userRoom = (userId: string) => `user:${userId}`;

export const NOTIFICATION_EVENTS = {
  NEW: "notification:new",
} as const;

export const formatStageName = (name: string) =>
  name.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
