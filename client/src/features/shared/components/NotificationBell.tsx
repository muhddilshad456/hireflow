import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "../../../context/NotificationContext";
import type { AppNotification } from "../../../types/notification/notification";
import { timeAgo } from "../../../utils/notification/Notificationutils";

const DROPDOWN_LIMIT = 8;

interface NotificationBellProps {
  viewAllRoute: string;
  buttonClassName?: string;
}

const DEFAULT_BUTTON_CLASS =
  "relative flex h-8 w-8 items-center justify-center rounded-full text-[#555550] transition-colors hover:bg-black/5";

export function NotificationBell({
  viewAllRoute,
  buttonClassName = DEFAULT_BUTTON_CLASS,
}: NotificationBellProps) {
  const navigate = useNavigate();
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleItemClick = (n: AppNotification) => {
    markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const recent = items.slice(0, DROPDOWN_LIMIT);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        className={buttonClassName}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-16 z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
          {/* header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                <CheckCheck size={13} />
                Mark all as read
              </button>
            )}
          </div>

          {/* list */}
          <div className="max-h-[60vh] overflow-y-auto">
            {recent.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-gray-400">
                You're all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recent.map((n) => (
                  <li key={n._id}>
                    <button
                      onClick={() => handleItemClick(n)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                        n.isRead ? "" : "bg-blue-50/40"
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                          n.isRead ? "bg-transparent" : "bg-blue-500"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[13px] text-gray-900 ${
                            n.isRead ? "font-medium" : "font-bold"
                          }`}
                        >
                          {n.title}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-gray-500">
                          {n.message}
                        </span>
                        <span className="mt-1 block text-[11px] text-gray-400">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* footer */}
          <button
            onClick={() => {
              setOpen(false);
              navigate(viewAllRoute);
            }}
            className="w-full border-t border-gray-100 px-4 py-3 text-center text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
