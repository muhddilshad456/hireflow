import { useState, useEffect } from "react";
import { Header } from "../../user/shared/components/Header";
import { verifyChangeEmail } from "../services/authService";
import { useSearchParams } from "react-router-dom";

type State = "verifying" | "success" | "failed";

export function EmailVerificationResultPage() {
  const [state, setState] = useState<State>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const verify = async () => {
    try {
      if (!token) {
        console.log("Token missing");
        return;
      }
      setState("verifying");
      setErrorMessage("");
      const result = await verifyChangeEmail({ token });
      console.log(result);
      setState("success");
    } catch (error: any) {
      console.log(error?.response);
      setErrorMessage(error?.response?.data?.message);
      setState("failed");
    }
  };

  useEffect(() => {
    verify();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex flex-col">
      {/* Navbar */}
      <Header />

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 px-8 py-10 flex flex-col items-center gap-6">
          {/* VERIFYING */}
          {state === "verifying" && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#FFF3EC] flex items-center justify-center">
                <svg
                  className="w-16 h-16 animate-spin absolute"
                  viewBox="0 0 64 64"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#FCCAAA"
                    strokeWidth="4"
                  />
                  <path
                    d="M32 4 A28 28 0 0 1 60 32"
                    fill="none"
                    stroke="#F26522"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                <svg
                  className="w-7 h-7 text-[#F26522] relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  Verifying your email…
                </h1>
                <p className="text-sm text-gray-500">
                  Please wait while we confirm your new address.
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#F26522] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </>
          )}

          {/* SUCCESS */}
          {state === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  Email verified!
                </h1>
                <p className="text-sm text-gray-500">
                  Your new email address is now active.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full pt-2">
                <a
                  href="/profile"
                  className="w-full bg-[#F26522] hover:bg-[#d95a18] text-white text-sm font-semibold py-3.5 rounded-xl text-center transition-colors"
                >
                  Back to profile
                </a>
              </div>
            </>
          )}

          {/* FAILED */}
          {state === "failed" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  Verification failed
                </h1>
                <p className="text-sm text-gray-500">{errorMessage}</p>
              </div>
              <div className="flex flex-col gap-3 w-full pt-2">
                <button
                  onClick={verify}
                  className="w-full bg-[#F26522] hover:bg-[#d95a18] text-white text-sm font-semibold py-3.5 rounded-xl transition-colors"
                >
                  Try again
                </button>
                <a
                  href="/profile"
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-3.5 rounded-xl border border-gray-200 text-center transition-colors"
                >
                  ← Back to profile
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
