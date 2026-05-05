import { useState } from "react";

const IcoFilter = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IcoChevron = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export function FilterDropdown<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const dotColor: Record<string, string> = {
    Active: "bg-green-500",
    Blocked: "bg-red-500",
    All: "bg-gray-300",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-all shadow-sm min-w-[105px] justify-between"
      >
        <span className="flex items-center gap-1.5">
          <IcoFilter />
          {value}
        </span>
        <IcoChevron />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-30 overflow-hidden py-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 transition-colors
                ${value === opt ? "bg-violet-50 text-violet-600" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${dotColor[opt] ?? "bg-gray-300"}`}
              />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
