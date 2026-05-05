import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../../../../shared/services/authService";
import ResetPasswordForm from "../../../../shared/components/ResetPasswordForm";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const handleResetPassword = async (password: string) => {
    if (!token) {
      console.error("Token missing");
      return;
    }

    try {
      const res = await resetPasswordApi({ password, token });
      console.log(res);
      toast.success("Password changed");
      navigate("/company/login");
    } catch (error: any) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.message);
    }
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#f5f5f0", fontFamily: "'Georgia', serif" }}
    >
      {/* Card */}
      <div className="w-full max-w-4xl min-h-[420px] flex rounded-2xl overflow-hidden shadow-2xl bg-white">
        {/* Left branding panel */}
        <div
          className="hidden md:flex flex-col items-center justify-center w-2/5 px-10 py-14 relative"
          style={{ backgroundColor: "#f5f5f0" }}
        >
          {/* Decorative circles */}
          <div
            className="absolute top-8 left-8 w-20 h-20 rounded-full opacity-20"
            style={{ backgroundColor: "#6abf4b" }}
          />
          <div
            className="absolute bottom-12 right-6 w-14 h-14 rounded-full opacity-15"
            style={{ backgroundColor: "#e84040" }}
          />
          <div
            className="absolute top-1/2 left-4 w-6 h-6 rounded-full opacity-25"
            style={{ backgroundColor: "#6abf4b" }}
          />

          {/* Logo */}
          <div className="relative z-10 text-center select-none">
            <div className="text-5xl font-black tracking-tight leading-none mb-4">
              <span style={{ color: "#e84040" }}>Hire</span>
              <span style={{ color: "#1a1a1a" }}>Flow</span>
            </div>
            <div
              className="text-sm tracking-widest uppercase font-medium mt-2"
              style={{ color: "#888", letterSpacing: "0.2em" }}
            >
              Talent, simplified
            </div>
          </div>

          {/* Tagline */}
          <p
            className="relative z-10 text-center text-sm mt-10 leading-relaxed"
            style={{ color: "#999", maxWidth: "180px" }}
          >
            Connect with the right recruiters and candidates effortlessly.
          </p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-100" />

        {/* Right form panel */}
        <div className="flex flex-col justify-center flex-1 px-10 py-14">
          <ResetPasswordForm
            onSubmit={handleResetPassword}
            buttonColor="#6abf4b"
            hoverColor="#6abf4b"
            focusColor="#6abf4b"
            buttonShadow="#8abf4b"
          />
        </div>
      </div>
    </div>
  );
}
