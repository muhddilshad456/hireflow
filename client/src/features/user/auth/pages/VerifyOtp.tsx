import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserHeader from "../../../shared/components/UserHeader";
import {
  resendOtpApi,
  verifyOtpApi,
} from "../../../shared/services/authService";
import { OtpForm } from "../../../shared/components/OtpForm";
import toast from "react-hot-toast";

// ── Types ────────────────────────────────────────────────────────────────────

const FEATURE_TAGS: string[] = [
  "✦ AI Screening",
  "✦ Smart Pipelines",
  "✦ Collaboration",
  "✦ Analytics",
];
const AVATAR_COLORS: string[] = ["#f87171", "#fb923c", "#fbbf24", "#34d399"];

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

function BrandingSection() {
  return (
    <div className="flex flex-col items-center text-center gap-3 sm:gap-4 py-5 sm:py-6 lg:py-0 px-4 relative">
      {/* Decorative blobs — only visible on lg+ */}
      <div
        className="hidden lg:block absolute rounded-full pointer-events-none"
        style={{
          top: "25%",
          left: "20%",
          width: 280,
          height: 280,
          background: "rgba(242,106,80,0.10)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="hidden lg:block absolute rounded-full pointer-events-none"
        style={{
          bottom: "28%",
          right: "18%",
          width: 200,
          height: 200,
          background: "rgba(251,191,36,0.12)",
          filter: "blur(48px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4">
        <Logo size="hero" />

        <p
          className="text-gray-500 leading-relaxed font-light max-w-xs sm:max-w-sm"
          style={{ fontSize: "clamp(13px, 1.2vw, 17px)" }}
        >
          The modern hiring platform that helps teams{" "}
          <span className="text-gray-800 font-semibold">
            find, track, and close
          </span>{" "}
          top talent — faster than ever.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {FEATURE_TAGS.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                backdropFilter: "blur(8px)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex">
            {AVATAR_COLORS.map((color, i) => (
              <div
                key={color}
                className="rounded-full border-2 border-white"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: color,
                  marginLeft: i === 0 ? 0 : -8,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Trusted by <span className="font-bold text-gray-800">2,400+</span>{" "}
            teams
          </p>
        </div>
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="text-center py-4">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Account created!</h2>
      <p className="text-sm text-gray-400">
        Check your email to verify your account.
      </p>
    </div>
  );
}

// ── Root Component ────────────────────────────────────────────────────────────

const VerifyOtp = () => {
  const [done, setDone] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // 🔹 State
  const [loading, setLoading] = useState(false);

  // 🔹 Verify OTP
  const handleVerify = async (otp: string) => {
    setLoading(true);

    try {
      const res = await verifyOtpApi({
        email,
        otp,
      });
      console.log(res.data);
      toast.success("Account created.");
      navigate("/login");
    } catch (error: any) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Resend OTP
  const handleResend = async () => {
    try {
      const result = await resendOtpApi({ email });
      console.log(result);
      toast.success("Otp resend successfull");
    } catch (error: any) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.message);
    }
  };

  // 🔹 Change Email
  const handleChangeEmail = () => {
    navigate("/signup"); // or go back to email input page
  };

  // 🔹 Back to Login
  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div
      className="relative h-screen w-full overflow-x-hidden"
      style={{ background: "#eef2f7", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,237,213,0.4) 0%, rgba(238,242,247,1) 50%, rgba(219,234,254,0.2) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <UserHeader />

        {/*
          Layout strategy:
          - mobile/sm  : single column, branding on top, form below
          - lg+        : two-column side-by-side (original layout)
        */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* ── Left / Top: Branding ── */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-10 lg:px-16 relative overflow-hidden">
            <BrandingSection />
          </div>

          {/* ── Divider: horizontal on mobile, vertical on desktop ── */}
          <div
            className="mx-6 my-0 lg:mx-0 lg:my-8 self-stretch"
            style={{
              background: "rgba(0,0,0,0.07)",
              // horizontal line on mobile, vertical line on desktop
              height: "1px",
              width: "auto",
            }}
          />

          {/* ── Right / Bottom: Form ── */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 lg:px-10 py-2 lg:py-4">
            <div
              className="w-full rounded-3xl flex flex-col justify-center"
              style={{
                maxWidth: 420,
                padding: "12px 16px",
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "2px solid rgba(255,255,255,0.85)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
              }}
            >
              {done ? (
                <SuccessState />
              ) : (
                <OtpForm
                  email="user@gmail.com"
                  onVerify={handleVerify}
                  onResend={handleResend}
                  onChangeEmail={handleChangeEmail}
                  onBack={handleBack}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VerifyOtp;
