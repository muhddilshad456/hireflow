import { useState } from "react";

interface UserDropdownProps {
  avatarUrl: string;
  onProfile: () => void;
  onLogout: () => void;
}

export function ProfileDropdown({
  avatarUrl,
  onProfile,
  onLogout,
}: UserDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Avatar */}
      <img
        src={avatarUrl}
        alt="avatar"
        className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-200 hover:ring-violet-400 transition-all cursor-pointer"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full pt-2 w-36">
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
        </div>
      )}
    </div>
  );
}
