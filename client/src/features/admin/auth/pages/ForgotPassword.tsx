import UserHeader from "../../../shared/components/UserHeader";
import { forgotPasswordApi } from "../../../shared/services/authService";
import ForgotPasswordForm from "../../../shared/components/ForgotPasswordForm";

export default function ForgotPassword() {
  const handleForgotPassword = async (email: string) => {
    const res = await forgotPasswordApi({ email });
    console.log(res);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <UserHeader />

      {/* Page body */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo (centered, in form area) */}
        <div className="mb-12 select-none">
          <span
            className="text-4xl font-bold tracking-tight"
            style={{ color: "#f47560" }}
          >
            Hire
          </span>
          <span className="text-4xl font-bold tracking-tight text-gray-900">
            Flow
          </span>
        </div>

        {/* Card */}
        <ForgotPasswordForm
          onSubmit={handleForgotPassword}
          buttonColor="#7c3aed"
          buttonShadow="#7c3aed"
          focusColor="#7c3aed"
          hoverColor="#7c3aed"
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease both;
        }
      `}</style>
    </div>
  );
}
