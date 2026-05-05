import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../../../../hooks/reduxHooks";
import type { ChangeEvent } from "react";
import PrimaryButton from "../../../shared/components/FormButton";
import FormFieldInput from "../../../shared/components/FormFieldInput";
import { loginApi } from "../../../shared/services/authService";
import { setCredentials } from "../../../../redux/slice/authSlice";
import toast from "react-hot-toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const INITIAL_FORM: FormState = { email: "", password: "" };

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!EMAIL_REGEX.test(form.email)) errors.email = "Enter a valid email";
  if (form.password.length < 8) errors.password = "At least 8 characters";
  return errors;
}

export default function Login() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleChange =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length != 0) return;
    try {
      const res = await loginApi({
        email: form.email,
        password: form.password,
      });
      const token = res.accessToken;
      dispatch(
        setCredentials({
          user: res.user,
          token,
        }),
      );
      toast.success("Logged in");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.log("ERROR DATA:", error.response?.data);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left — Branding */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-white border-r border-gray-200">
        <div className="text-center select-none">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-red-400">Hire</span>
            <span className="text-gray-800">Flow</span>
          </h1>
          <p className="mt-3 text-sm text-gray-400 tracking-widest uppercase font-medium">
            Recruitment Platform
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Admin Login
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <FormFieldInput
              label="Email"
              type="email"
              placeholder="Enter your email..."
              onChange={handleChange("email")}
              value={form.email}
              error={errors.email}
              focusColor="#7c3aed"
            />
            {/* Password */}
            <FormFieldInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              onChange={handleChange("password")}
              value={form.password}
              error={errors.password}
              focusColor="#7c3aed"
            />

            <div className="flex justify-end mb-2">
              <Link
                to="/admin/forgot-password"
                className="text-xs font-semibold hover:underline"
                style={{ color: "#f26a50" }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Button */}
            <PrimaryButton
              text="Login"
              onClick={handleSubmit}
              bgColor="#7c3aed"
              hoverColor="#6d28d9"
              shadowColor="#5b21b6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
