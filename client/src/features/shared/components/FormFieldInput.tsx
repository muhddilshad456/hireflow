import type { ChangeEvent } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldInputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  error?: string;
  focusColor?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function FormFieldInput({
  label,
  type,
  placeholder,
  value,
  error,
  focusColor = "#f26a50",
  onChange,
}: FormFieldInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = focusColor;
    e.target.style.background = "rgba(255,255,255,0.92)";
    e.target.style.boxShadow =
      "inset 2px 2px 6px rgba(0,0,0,0.05), 0 0 0 3px rgba(242,106,80,0.14), 0 2px 0 rgba(0,0,0,0.04)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = error ? "#f87171" : "rgba(255,255,255,0.9)";
    e.target.style.background = "rgba(255,255,255,0.65)";
    e.target.style.boxShadow =
      "inset 2px 2px 6px rgba(0,0,0,0.07), 0 2px 0 rgba(0,0,0,0.05)";
  };

  return (
    <div className="mb-2.5 relative">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full px-4 py-3 rounded-2xl text-sm text-gray-900 outline-none font-medium"
        style={{
          border: `2px solid ${error ? "#f87171" : "rgba(255,255,255,0.9)"}`,
          background: "rgba(255,255,255,0.65)",
          boxShadow:
            "inset 2px 2px 6px rgba(0,0,0,0.07), 0 2px 0 rgba(0,0,0,0.05)",
          transition: "all 0.15s ease",
          fontFamily: "inherit",
        }}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[38px] text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
      {error && (
        <p className="text-xs font-medium mt-1" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default FormFieldInput;
