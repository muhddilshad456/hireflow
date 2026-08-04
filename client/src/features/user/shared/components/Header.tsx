import React, { useState } from "react";
import { Bell, Heart, Search, Menu, X } from "lucide-react";
import { logoutApi } from "../../../shared/services/authService";
import { logout } from "../../../../redux/slice/authSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../hooks/reduxHooks";
import { ProfileDropdown } from "../../../shared/components/ProfileDropdown";
import { ConfirmModal } from "../../../shared/components/ConfirmationModal";

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", active: true },
  { label: "Jobs", href: "/jobs" },
  { label: "Applied Jobs", href: "/applied-jobs" },
  { label: "Messages", href: "#" },
];

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const logoutUser = () => setShowLogoutModal(true);
  const cancelModal = () => setShowLogoutModal(false);
  const userId = useAppSelector((state) => state.auth.user?.id);

  const handleLogout = async () => {
    if (!userId) {
      console.log("userId not accesible");
      return;
    }
    try {
      await logoutApi({ id: userId });
      dispatch(logout());
      toast.success("Logged out");
      navigate("/admin/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Logo */}
            <a href="#" className="flex-shrink-0">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-[#F4522A]">Hire</span>
                <span className="text-gray-900">Flow</span>
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? "text-[#F4522A]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Search */}
            {/* <div className="hidden sm:flex flex-1 max-w-xs items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 gap-2 focus-within:border-[#F4522A] focus-within:ring-1 focus-within:ring-[#F4522A] transition-all">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for jobs"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
            </div> */}

            {/* Icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#F4522A]">
                <Heart size={18} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#F4522A]">
                <Bell size={18} />
              </button>
              <ProfileDropdown
                avatarUrl="https://i.pravatar.cc/40?img=12"
                onProfile={() => navigate("/profile")}
                onLogout={logoutUser}
              />

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="sm:hidden pb-3">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 gap-2 focus-within:border-[#F4522A] focus-within:ring-1 focus-within:ring-[#F4522A] transition-all">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for jobs"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.active
                    ? "text-[#F4522A] bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>
      <ConfirmModal
        open={showLogoutModal}
        message="Do you want to logout"
        title="Logout"
        onConfirm={handleLogout}
        onCancel={cancelModal}
      />
    </>
  );
};
