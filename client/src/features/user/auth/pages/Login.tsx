import { useState } from "react";
import type { ChangeEvent } from "react";
import UserHeader from "../../../shared/components/UserHeader";
import FormFieldInput from "../../../shared/components/FormFieldInput";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../../../shared/services/authService";
import PrimaryButton from "../../../shared/components/FormButton";
import { useAppDispatch } from "../../../../hooks/reduxHooks";
import { setCredentials } from "../../../../redux/slice/authSlice";
import toast from "react-hot-toast";

// ── Types ────────────────────────────────────────────────────────────────────

const FEATURE_TAGS: string[] = [
  "✦ AI Screening",
  "✦ Smart Pipelines",
  "✦ Collaboration",
  "✦ Analytics",
];
const AVATAR_COLORS: string[] = ["#f87171", "#fb923c", "#fbbf24", "#34d399"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INITIAL_FORM: FormState = { email: "", password: "" };

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

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!EMAIL_REGEX.test(form.email)) errors.email = "Enter a valid email";
  if (form.password.length < 8) errors.password = "At least 8 characters";
  return errors;
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginFormProps {
  form: FormState;
  errors: FormErrors;
  onChange: (
    field: keyof FormState,
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onGoogleSignup: () => void;
}

function LoginForm({
  form,
  errors,
  onChange,
  onSubmit,
  onGoogleSignup,
}: LoginFormProps) {
  const handleGoogleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.95)";
    e.currentTarget.style.transform = "translateY(-1px)";
  };
  const handleGoogleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.70)";
    e.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
        Create your account
      </h2>

      <FormFieldInput
        label="Email"
        type="email"
        placeholder="you@company.com"
        value={form.email}
        error={errors.email}
        onChange={onChange("email")}
      />
      <FormFieldInput
        label="Password"
        type="password"
        placeholder="Min. 8 characters"
        value={form.password}
        error={errors.password}
        onChange={onChange("password")}
      />

      <div className="flex justify-end mb-2">
        <Link
          to="/forgot-password"
          className="text-xs font-semibold hover:underline"
          style={{ color: "#f26a50" }}
        >
          Forgot Password?
        </Link>
      </div>

      <PrimaryButton text="Login" onClick={onSubmit} />

      <div className="flex items-center gap-2.5 my-3">
        <div
          className="flex-1"
          style={{ height: 1, background: "rgba(0,0,0,0.09)" }}
        />
        <span className="text-xs font-medium text-gray-400">
          Or continue with
        </span>
        <div
          className="flex-1"
          style={{ height: 1, background: "rgba(0,0,0,0.09)" }}
        />
      </div>

      <button
        onClick={onGoogleSignup}
        onMouseEnter={handleGoogleEnter}
        onMouseLeave={handleGoogleLeave}
        className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-700 cursor-pointer flex items-center justify-center gap-2"
        style={{
          border: "2px solid rgba(255,255,255,0.9)",
          background: "rgba(255,255,255,0.70)",
          fontFamily: "inherit",
          boxShadow: "0 3px 0px rgba(0,0,0,0.09), 0 6px 16px rgba(0,0,0,0.06)",
          transition: "all 0.14s ease",
        }}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold hover:underline"
          style={{ color: "#f26a50" }}
        >
          Signup
        </Link>
      </p>
    </>
  );
}

// ── Root Component ────────────────────────────────────────────────────────────

const Login = () => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [done, setDone] = useState<boolean>(false);
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
      console.log("login response : ", res);
      const token = res.accessToken;
      dispatch(
        setCredentials({
          user: res.user,
          token,
        }),
      );
      setDone(true);
      toast.success("Logged in");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message);
      console.error("login failed : ", error.response?.data);
    }
  };

  const handleGoogleSignup = () =>
    (window.location.href = "http://localhost:5000/api/v1/auth/google");

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
                padding: "clamp(12px, 2vw, 20px) clamp(16px, 4vw, 28px)",
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
                <LoginForm
                  form={form}
                  errors={errors}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onGoogleSignup={handleGoogleSignup}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
