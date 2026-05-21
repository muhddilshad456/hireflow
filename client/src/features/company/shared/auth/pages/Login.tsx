import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent } from "react";
import { loginApi } from "../../../../shared/services/authService";
import { useAppDispatch } from "../../../../../hooks/reduxHooks";
import { setCredentials } from "../../../../../redux/slice/authSlice";
import FormFieldInput from "../../../../shared/components/FormFieldInput";
import PrimaryButton from "../../../../shared/components/FormButton";
import toast from "react-hot-toast";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL_FORM: FormState = {
  email: "",
  password: "",
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!EMAIL_REGEX.test(form.email)) errors.email = "Enter a valid email";
  if (form.password.length < 8) errors.password = "At least 8 characters";
  return errors;
}

export default function Login() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleChange =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLogin = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length !== 0) return;
    try {
      const res = await loginApi({
        email: form.email,
        password: form.password,
      });
      dispatch(
        setCredentials({
          user: res.user,
          token: res.accessToken,
        }),
      );
      console.log("login response =", res);
      toast.success("Logged in");
      if (res.user.role == "company_admin") {
        navigate("company/admin/dashboard");
      } else if (res.user.role == "company_recruiter") {
        navigate("/company/recruiter/dashboard");
      } else {
        navigate("/company/interviewer/dashboard");
      }
    } catch (error: any) {
      console.error("login failed : ", error.response?.data);
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
          {/* Mobile logo */}
          <div className="md:hidden text-3xl font-black mb-8 select-none">
            <span style={{ color: "#e84040" }}>Hire</span>
            <span style={{ color: "#1a1a1a" }}>Flow</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-1"
              style={{ color: "#6abf4b", fontFamily: "'Georgia', serif" }}
            >
              Login
            </h1>
            <p className="text-base" style={{ color: "#555" }}>
              Welcome back
            </p>
          </div>

          {/* Email */}
          <div className="mb-2">
            <FormFieldInput
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              error={errors.email}
              focusColor="#6abf4b"
              onChange={handleChange("email")}
            />
          </div>

          {/* Password */}

          <div className="mb-5">
            <FormFieldInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              error={errors.password}
              focusColor="#6abf4b"
              onChange={handleChange("password")}
            />
          </div>

          {/* Forgot password */}
          <div className="flex justify-end mb-6">
            <button
              type="button"
              className="text-xs transition-colors"
              style={{ color: "#6abf4b" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#509e35")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6abf4b")}
              onClick={() => navigate("/company/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <PrimaryButton
            text="Signup"
            onClick={handleLogin}
            bgColor="#6abf4b"
            hoverColor="#6abf4b"
            shadowColor="#8abf4b"
          />

          {/* Footer links */}
          <div className="mt-5 text-center space-y-1.5">
            <p className="text-xs" style={{ color: "#aaa" }}>
              Don't have an account?{" "}
              <button
                type="button"
                className="font-medium transition-colors"
                style={{ color: "#6abf4b" }}
                onClick={() => navigate("/company/signup")}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#509e35")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6abf4b")}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
