import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import type { AppNotification } from "../types/notification/notification";
import { useSocket } from "./SocketContext";
import { useAppSelector } from "../hooks/reduxHooks";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../features/shared/services/notificationService";

const PAGE_SIZE = 20;

interface NotificationContextValue {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

// Must be placed INSIDE your SocketProvider (and the Redux Provider)
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const socket = useSocket();
  const token = useAppSelector((state) => state.auth.token);

  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications(1, PAGE_SIZE);
      setItems(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      setPage(1);
      setHasMore(res.data.page < res.data.totalPages);
    } catch (error: any) {
      console.log(error?.response);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setItems([]);
      setUnreadCount(0);
      setHasMore(false);
      return;
    }
    loadFirstPage();
  }, [token, socket, loadFirstPage]);

  // Live notifications
  useEffect(() => {
    if (!socket) return;

    const onNew = (n: AppNotification) => {
      setItems((prev) => [n, ...prev.filter((x) => x._id !== n._id)]);
      setUnreadCount((c) => c + 1);
      toast(n.title, { icon: "🔔" });
    };

    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew);
    };
  }, [socket]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await getNotifications(page + 1, PAGE_SIZE);
      setItems((prev) => {
        const seen = new Set(prev.map((n) => n._id));
        return [
          ...prev,
          ...res.data.notifications.filter((n) => !seen.has(n._id)),
        ];
      });
      setPage(res.data.page);
      setHasMore(res.data.page < res.data.totalPages);
    } catch (error: any) {
      console.log(error?.response);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  const markRead = useCallback(
    async (id: string) => {
      const target = items.find((n) => n._id === id);
      if (!target || target.isRead) return;

      // Update the screen first; reload if the request fails
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await markNotificationRead(id);
      } catch {
        loadFirstPage();
      }
    },
    [items, loadFirstPage],
  );

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      loadFirstPage();
    }
  }, [unreadCount, loadFirstPage]);

  return (
    <NotificationContext.Provider
      value={{
        items,
        unreadCount,
        loading,
        hasMore,
        loadMore,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }
  return ctx;
};
