import { useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PrimaryButton from "../../../../shared/components/FormButton";
import FormFieldInput from "../../../../shared/components/FormFieldInput";
import toast from "react-hot-toast";
import { acceptInviteApi } from "../../../../shared/services/authService";

interface FormState {
  password: string;
  confirm: string;
}

interface FormErrors {
  password?: string;
  confirm?: string;
}

const INITIAL_FORM: FormState = {
  password: "",
  confirm: "",
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (form.password.length < 8) errors.password = "At least 8 characters";
  if (form.confirm !== form.password) errors.confirm = "Passwords don't match";
  return errors;
}

export default function AcceptInvite() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  if (!id || !token) return;

  const handleCreate = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length !== 0) return;
    try {
      const result = await acceptInviteApi({
        id,
        token,
        password: form.password,
      });
      console.log("result from handle accept invitation : ", result);
      navigate("/company/login");
      toast.success("Account created.");
    } catch (error: any) {
      console.error("login failed : ", error.response.data);
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
              Create Account
            </h1>
            <p className="text-base" style={{ color: "#555" }}>
              Create As Recruiter
            </p>
          </div>

          {/* Password */}

          <div className="mb-2">
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
          {/* confirm Password */}

          <div className="mb-2">
            <FormFieldInput
              label="Confirm Password"
              type="password"
              placeholder="Enter your password"
              value={form.confirm}
              error={errors.confirm}
              focusColor="#6abf4b"
              onChange={handleChange("confirm")}
            />
          </div>

          {/* Signup Button */}
          <PrimaryButton
            text="Create Account"
            onClick={handleCreate}
            bgColor="#6abf4b"
            hoverColor="#6abf4b"
            shadowColor="#8abf4b"
          />
        </div>
      </div>
    </div>
  );
}
