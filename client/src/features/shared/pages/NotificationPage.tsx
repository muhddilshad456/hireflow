import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "../../../context/NotificationContext";
import type { AppNotification } from "../../../types/notification/notification";
import { timeAgo } from "../../../utils/notification/Notificationutils";

// Content only (no header), so each role can render it inside its own layout.
// On the candidate side, render your <Header /> above it.
export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    items,
    unreadCount,
    loading,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();

  const handleClick = (n: AppNotification) => {
    markRead(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading && items.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-gray-400">
            Loading notifications...
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Bell size={22} />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-600">
              No notifications yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Notifications are removed automatically after 30 days.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((n) => (
              <li key={n._id}>
                <button
                  onClick={() => handleClick(n)}
                  className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50 ${
                    n.isRead ? "" : "bg-blue-50/40"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                      n.isRead ? "bg-transparent" : "bg-blue-500"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span
                        className={`text-sm text-gray-900 ${
                          n.isRead ? "font-medium" : "font-bold"
                        }`}
                      >
                        {n.title}
                      </span>
                      <span className="flex-shrink-0 text-[11px] text-gray-400">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                    <span className="mt-1 block text-[13px] text-gray-500">
                      {n.message}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
