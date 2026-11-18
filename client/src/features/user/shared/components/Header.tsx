import React, { useState } from "react";
import { Heart, Search, Menu, X } from "lucide-react";
import { logoutApi } from "../../../shared/services/authService";
import { logout } from "../../../../redux/slice/authSlice";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../hooks/reduxHooks";
import { ProfileDropdown } from "../../../shared/components/ProfileDropdown";
import { ConfirmModal } from "../../../shared/components/ConfirmationModal";
import { NotificationBell } from "../../../shared/components/NotificationBell";
import { NavLink } from "react-router-dom";

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", active: true },
  { label: "Jobs", href: "/jobs" },
];

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const logoutUser = () => setShowLogoutModal(true);
  const cancelModal = () => setShowLogoutModal(false);
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    if (!user?.id) {
      console.log("userId not accesible");
      return;
    }
    try {
      await logoutApi({ id: user?.id });
      dispatch(logout());
      toast.success("Logged out");
      navigate("/login");
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
            <Link to="/" className="flex-shrink-0">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-[#F4522A]">Hire</span>
                <span className="text-gray-900">Flow</span>
              </span>
            </Link>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#F4522A] bg-orange-50"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {user && (
                <NavLink
                  to="/applied-jobs"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#F4522A] bg-orange-50"
                        : "text-gray-600 hover:text-gray-900"
                    }`
                  }
                >
                  Applied Jobs
                </NavLink>
              )}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Wishlist */}
                  <button
                    onClick={() => navigate("/wishlist")}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#F4522A]"
                  >
                    <Heart size={18} />
                  </button>

                  {/* Notifications */}
                  <NotificationBell
                    viewAllRoute="/notifications"
                    buttonClassName="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-[#F4522A]"
                  />

                  {/* Profile */}
                  <ProfileDropdown
                    avatarUrl={user.profilePicture ?? ""}
                    onProfile={() => navigate("/profile")}
                    onLogout={logoutUser}
                    name={user.name ?? ""}
                  />

                  {/* Mobile Menu Toggle */}
                  <button
                    className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                    onClick={() => setMenuOpen((v) => !v)}
                  >
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                  </button>
                </>
              ) : (
                <>
                  {/* Guest Actions */}
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => navigate("/signup")}
                    className="px-4 py-2 text-sm font-medium text-[#F4522A] hover:text-gray-900"
                  >
                    Sign Up
                  </button>

                  {/* Mobile Menu Toggle */}
                  <button
                    className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                    onClick={() => setMenuOpen((v) => !v)}
                  >
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                  </button>
                </>
              )}
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
              <NavLink
                key={item.label}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#F4522A] bg-orange-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            {user && (
              <NavLink
                to="/applied-jobs"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#F4522A] bg-orange-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                Applied Jobs
              </NavLink>
            )}

            {!user && (
              <>
                <NavLink
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </NavLink>

                <NavLink
                  to="/signup"
                  className="px-3 py-2 rounded-md text-sm font-medium text-[#F4522A] hover:bg-orange-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </NavLink>
              </>
            )}
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
