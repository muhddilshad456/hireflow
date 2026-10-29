import { useState } from "react";
import { createPortal } from "react-dom";

interface UserDropdownProps {
  avatarUrl: string;
  onProfile: () => void;
  onLogout: () => void;
  name: string;
}

export function ProfileDropdown({
  avatarUrl,
  onProfile,
  onLogout,
  name,
}: UserDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-200"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center font-semibold uppercase">
          {name?.trim().charAt(0) || "U"}
        </div>
      )}

      {/* Dropdown */}
      {open &&
        createPortal(
          <div className="fixed z-[9999] right-6 top-12 w-36">
            {/* This wrapper prevents gap */}
            <div className="bg-white border border-gray-100 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={onProfile}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Profile
              </button>

              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
