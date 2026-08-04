import React from "react";
import { FileText, MessageCircle, User as UserIcon } from "lucide-react";

/* ---------------- Pill button ---------------- */

export const PillButton: React.FC<{
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ variant = "primary", onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={
      variant === "primary"
        ? "rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
        : "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
    }
  >
    {children}
  </button>
);

/* ---------------- Avatar block ---------------- */

export const CandidateAvatarBlock: React.FC<{
  avatarUrl?: string;
  className?: string;
}> = ({ avatarUrl, className = "h-20 w-32" }) => (
  <div
    className={`flex shrink-0 items-center justify-center rounded-xl bg-orange-100 ${className}`}
    style={
      avatarUrl
        ? {
            backgroundImage: `url(${avatarUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : undefined
    }
  >
    {!avatarUrl && (
      <UserIcon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
    )}
  </div>
);

/* ---------------- Name + experience/skills + View CV / Chat row ---------------- */

export const CandidateHeader: React.FC<{
  name: string;
  experienceYears?: number;
  skills?: string[];
  resumeUrl?: string;
  onChat?: () => void;
}> = ({ name, experienceYears, skills, resumeUrl, onChat }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
    {(experienceYears || skills?.length) && (
      <p className="mt-0.5 text-xs text-gray-500">
        {experienceYears ? `${experienceYears} years experience` : ""}
        {experienceYears && skills?.length ? " · " : ""}
        {skills?.join(", ")}
      </p>
    )}

    <div className="mt-3 flex flex-wrap gap-2">
      <PillButton
        variant="secondary"
        onClick={() => resumeUrl && window.open(resumeUrl, "_blank")}
        disabled={!resumeUrl}
      >
        <FileText className="h-3.5 w-3.5" /> View CV
      </PillButton>
      {onChat && (
        <PillButton variant="secondary" onClick={onChat}>
          <MessageCircle className="h-3.5 w-3.5" /> Chat
        </PillButton>
      )}
    </div>
  </div>
);

/* ---------------- Date/time schedule form ---------------- */

export const ScheduleForm: React.FC<{
  interviewLabel: string; // "Video call interview" | "Online interview"
  submitLabel: string; // "Submit Schedule" | "Schedule"
  date: string;
  time: string;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
}> = ({
  interviewLabel,
  submitLabel,
  date,
  time,
  onDateChange,
  onTimeChange,
  onSubmit,
  submitting,
}) => (
  <div className="mt-3">
    <p className="text-xs text-gray-500">{interviewLabel}</p>

    <div className="mt-2 flex flex-wrap gap-3">
      <div>
        <label className="text-xs text-gray-500">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="mt-1 block rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="mt-1 block rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
        />
      </div>
    </div>

    <div className="mt-3">
      <PillButton onClick={onSubmit} disabled={submitting || !date || !time}>
        {submitLabel}
      </PillButton>
    </div>
  </div>
);

/* ---------------- Pass/Fail segmented toggle ---------------- */

export const PassFailToggle: React.FC<{
  value: "PASS" | "FAIL" | null;
  onChange: (v: "PASS" | "FAIL") => void;
}> = ({ value, onChange }) => (
  <div className="flex rounded-full bg-gray-100 p-1 text-sm font-medium">
    <button
      onClick={() => onChange("PASS")}
      className={`flex-1 rounded-full py-1.5 transition ${
        value === "PASS" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
      }`}
    >
      Pass
    </button>
    <button
      onClick={() => onChange("FAIL")}
      className={`flex-1 rounded-full py-1.5 transition ${
        value === "FAIL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
      }`}
    >
      Fail
    </button>
  </div>
);

/* ---------------- Feedback textarea ---------------- */

export const FeedbackBox: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="mt-4">
    <label className="text-sm text-gray-700">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
    />
  </div>
);
