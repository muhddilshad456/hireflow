import { useSearchParams, useNavigate } from "react-router-dom";
import UserHeader from "../../../shared/components/UserHeader";
import ResetPasswordForm from "../../../shared/components/ResetPasswordForm";
import { resetPasswordApi } from "../../../shared/services/authService";
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

      toast.success("Password updated successfully");

      navigate("/admin/login");
    } catch (error: any) {
      console.log("ERROR DATA:", error.response?.data);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UserHeader />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <div className="mb-12">
          <span className="text-4xl font-bold text-orange-500">Hire</span>
          <span className="text-4xl font-bold text-gray-900">Flow</span>
        </div>

        {/* Reusable form */}
        <ResetPasswordForm
          onSubmit={handleResetPassword}
          buttonColor="#7c3aed"
          hoverColor="#7c3aed"
          buttonShadow="#7c3aed"
          focusColor="#7c3aed"
        />
      </div>
    </div>
  );
}
