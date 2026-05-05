import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "hero";
}
function Logo({ size = "md" }: LogoProps) {
  const cls =
    size === "sm"
      ? "text-2xl tracking-tight"
      : size === "hero"
        ? "tracking-tighter"
        : "text-[clamp(36px,4.5vw,76px)] tracking-tighter";

  const style = size === "hero" ? { fontSize: "clamp(30px, 5vw, 60px)" } : {};

  return (
    <span
      className={`font-black leading-none select-none ${cls}`}
      style={style}
    >
      <span style={{ color: "#f26a50" }}>Hire</span>
      <span className="text-gray-900">Flow</span>
    </span>
  );
}

function UserHeader() {
  const NAV_LINKS = [
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" },
  ];
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.7)",
      }}
    >
      <Logo size="sm" />
      <nav className="flex items-center gap-4 sm:gap-6">
        {/* Hide nav links on very small screens */}
        {NAV_LINKS.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900"
            style={{ transition: "color 0.15s" }}
          >
            {item.name}
          </Link>
        ))}
        <Link
          to="/login"
          className="text-sm font-semibold"
          style={{ color: "#f26a50" }}
        >
          Log in
        </Link>
      </nav>
    </header>
  );
}

export default UserHeader;
