import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent, ClipboardEvent } from "react";

function ClockIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      style={{ transition: "stroke 0.5s ease" }}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path
        d="M12 7v5l3 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="3"
        stroke="#f26a50"
        strokeWidth="1.7"
      />
      <path
        d="M2 8l8.586 5.657a2 2 0 002.828 0L22 8"
        stroke="#f26a50"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15 13l3 3m0 0l-3 3m3-3H9"
        stroke="#f26a50"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M19 12H5M5 12l7-7M5 12l7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BOX_COUNT = 6;
const OTP_EXPIRY_SECONDS = 120; // 2 minutet

interface EmailVerifyFormProps {
  email?: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onChangeEmail: () => void;
  onBack: () => void;
  error?: string;
  loading?: boolean;
}

export function OtpForm({
  email = "user@gmail.com",
  onVerify,
  onResend,
  onChangeEmail,
  onBack,
  error,
  loading,
}: EmailVerifyFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(BOX_COUNT).fill(""));
  const [expiry, setExpiry] = useState<number>(OTP_EXPIRY_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isExpired = expiry === 0;
  const codeComplete = digits.join("").length === BOX_COUNT;

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Expiry countdown
  useEffect(() => {
    if (expiry === 0) return;
    const t = setTimeout(() => setExpiry((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [expiry]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const update = (i: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    const next = [...digits];
    next[i] = clean ? clean[0] : "";
    setDigits(next);
    if (clean && i < BOX_COUNT - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < BOX_COUNT - 1)
      inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, BOX_COUNT);
    const next = Array(BOX_COUNT).fill("");
    text.split("").forEach((ch, i) => (next[i] = ch));
    setDigits(next);
    inputRefs.current[Math.min(text.length, BOX_COUNT - 1)]?.focus();
  };

  const handleResend = () => {
    setDigits(Array(BOX_COUNT).fill(""));
    setExpiry(OTP_EXPIRY_SECONDS);
    inputRefs.current[0]?.focus();
    onResend();
  };

  const handlePrimaryEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "#e85d44";
    e.currentTarget.style.transform = "translateY(-1px)";
    e.currentTarget.style.boxShadow = "0 5px 0 #c94e36";
  };
  const handlePrimaryLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "#f26a50";
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 4px 0 #c94e36";
  };

  // Timer color: green → amber → red
  const timerColor =
    expiry > 60 ? "#22c55e" : expiry > 30 ? "#f59e0b" : "#e85d44";

  return (
    <div className="text-center">
      {/* Icon */}
      <div
        className="flex items-center justify-center mx-auto mb-3"
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#f0f4ff",
        }}
      >
        <MailIcon />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
        Account Created
        <br />
        Successfully
      </h2>
      <p className="text-sm text-gray-500 mb-1 leading-relaxed">
        Enter the 6-digit verification code sent to your email.
      </p>
      <p className="text-sm font-semibold text-gray-800 mb-4">{email}</p>

      {/* Expiry Timer */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {isExpired ? (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(232,93,68,0.10)", color: "#e85d44" }}
          >
            Code expired
          </span>
        ) : (
          <>
            <ClockIcon color={timerColor} />
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: timerColor, transition: "color 0.5s ease" }}
            >
              {formatTime(expiry)}
            </span>
            <span className="text-xs text-gray-400">remaining</span>
          </>
        )}
      </div>

      {/* OTP inputs */}
      <div className="flex gap-1.5 justify-center mb-3" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={isExpired}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKey(e, i)}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#f26a50";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(242,106,80,0.18)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = isExpired
                ? "rgba(0,0,0,0.06)"
                : error
                  ? "#e85d44"
                  : "rgba(0,0,0,0.13)";
              e.currentTarget.style.boxShadow = "none";
            }}
            className="text-center text-lg font-bold outline-none transition-all rounded-xl"
            style={{
              width: 44,
              height: 50,
              fontFamily: "inherit",
              border: `1.5px solid ${
                isExpired
                  ? "rgba(0,0,0,0.06)"
                  : error
                    ? "#e85d44"
                    : "rgba(0,0,0,0.13)"
              }`,
              background: isExpired ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0.03)",
              caretColor: "#f26a50",
              color: isExpired ? "#bbb" : "inherit",
              boxShadow:
                error && !isExpired
                  ? "0 0 0 3px rgba(232,93,68,0.14)"
                  : undefined,
            }}
          />
        ))}
      </div>

      {error && !isExpired && (
        <p className="text-xs mb-2" style={{ color: "#e85d44" }}>
          {error}
        </p>
      )}

      {/* Resend row — only visible after expiry */}
      <p className="text-sm text-gray-500 mb-4" style={{ minHeight: 22 }}>
        {isExpired ? (
          <>
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              className="font-semibold border-none bg-transparent p-0 cursor-pointer hover:opacity-70 transition-opacity"
              style={{
                color: "#f26a50",
                fontFamily: "inherit",
                fontSize: "inherit",
              }}
            >
              Resend
            </button>
          </>
        ) : null}
      </p>

      {/* Verify button */}
      <button
        onClick={() => onVerify(digits.join(""))}
        disabled={loading || !codeComplete || isExpired}
        onMouseEnter={
          !loading && codeComplete && !isExpired
            ? handlePrimaryEnter
            : undefined
        }
        onMouseLeave={
          !loading && codeComplete && !isExpired
            ? handlePrimaryLeave
            : undefined
        }
        className="w-full py-3.5 rounded-2xl text-white text-sm font-bold border-none cursor-pointer mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "#f26a50",
          boxShadow: "0 4px 0 #c94e36",
          fontFamily: "inherit",
          transition: "all 0.13s ease",
        }}
      >
        {loading ? "Verifying…" : isExpired ? "Code Expired" : "Verify Email"}
      </button>

      <p className="text-sm text-gray-500 mb-4">
        Wrong email?{" "}
        <button
          onClick={onChangeEmail}
          className="font-semibold border-none bg-transparent p-0 cursor-pointer hover:underline"
          style={{
            color: "#f26a50",
            fontFamily: "inherit",
            fontSize: "inherit",
          }}
        >
          Change address
        </button>
      </p>

      <div
        className="border-t pt-4"
        style={{ borderColor: "rgba(0,0,0,0.09)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mx-auto text-sm text-gray-500 border-none bg-transparent cursor-pointer hover:text-gray-700 transition-colors"
          style={{ fontFamily: "inherit" }}
        >
          <BackArrow />
          Back to Login
        </button>
      </div>
    </div>
  );
}
