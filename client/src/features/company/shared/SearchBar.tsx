import type { ReactNode } from "react";

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  icon,
  className = "",
}: SearchInputProps) {
  return (
    <div
      className={`hidden sm:flex flex-1 max-w-xs items-center gap-2 bg-slate-200 border border-slate-100 rounded-xl px-3 py-2 ${className}`}
    >
      {icon && <span className="text-slate-400">{icon}</span>}

      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full"
        placeholder={placeholder}
      />
    </div>
  );
}
