import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "../../user/shared/components/Header";

// ─── Step Item ────────────────────────────────────────────────────────────────
const Step = ({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-semibold flex items-center justify-center mt-0.5">
      {number}
    </span>
    <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const newEmail: string = location.state?.email ?? "your new email";

  const [countdown, setCountdown] = useState<number>(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleResend = useCallback(async () => {
    if (countdown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendSuccess(false);
    try {
      // Replace with your actual API call, e.g. await api.resendVerificationEmail(newEmail)
      await new Promise((r) => setTimeout(r, 1000));
      setResendSuccess(true);
      setCountdown(60);
    } finally {
      setResendLoading(false);
    }
  }, [countdown, resendLoading]);

  //   const canResend = countdown === 0 && !resendLoading;

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 text-center">
            {/* Mail icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Verify your new email
            </h1>
            <p className="text-sm text-gray-500 mb-1">
              A verification link has been sent to
            </p>

            {/* Email pill */}
            <span className="inline-block bg-orange-50 text-orange-600 text-sm font-medium px-4 py-1.5 rounded-full border border-orange-200 mb-3">
              {newEmail}
            </span>

            <p className="text-xs sm:text-sm text-gray-400 mb-5 leading-relaxed">
              Click the link in that email to confirm your address. Your current
              email stays active until you verify.
            </p>

            {/* Divider */}
            <div className="border-t border-stone-100 mb-5" />

            {/* Steps */}
            <div className="text-left space-y-3 mb-6">
              <Step number={1}>
                Open your inbox for the new email address you entered.
              </Step>
              <Step number={2}>
                Find the email from HireFlow with the subject{" "}
                <span className="font-medium text-gray-700">
                  "Confirm your email change."
                </span>
              </Step>
              <Step number={3}>
                Click{" "}
                <span className="font-medium text-gray-700">
                  Verify email address
                </span>{" "}
                in that email.
              </Step>
            </div>

            {/* Resend success banner */}
            {resendSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-4 text-left">
                <svg
                  className="w-4 h-4 text-green-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <p className="text-xs text-green-700">
                  Verification email resent successfully.
                </p>
              </div>
            )}

            {/* Resend button */}
            {/* <button
              onClick={handleResend}
              disabled={!canResend}
              aria-label="Resend verification email"
              className={`w-full flex items-center justify-center gap-2 border rounded-lg py-3 text-sm font-medium transition-all mb-3 ${
                canResend
                  ? "border-orange-500 text-orange-500 hover:bg-orange-50 active:scale-[0.98]"
                  : "border-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              {resendLoading ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              )}
              {resendLoading
                ? "Sending…"
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend verification email"}
            </button> */}

            {/* Back to profile */}
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-lg py-3 text-sm font-medium transition-all mb-5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to profile
            </button>

            {/* Wrong email */}
            <p className="text-xs text-gray-400">
              Wrong email?{" "}
              <button
                onClick={() => navigate("/profile")}
                className="text-orange-500 hover:text-orange-600 font-medium underline underline-offset-2 transition-colors"
              >
                Change it again
              </button>
            </p>
          </div>

          {/* Help text below card */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Didn't receive it? Check your spam folder or{" "}
            <a href="#" className="text-orange-500 hover:underline">
              contact support
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
};
