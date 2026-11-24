import { useState } from "react";

interface PrimaryButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit";
  bgColor?: string;
  hoverColor?: string;
  shadowColor?: string;
  loading?: boolean;
  disabled?: boolean;
}

function PrimaryButton({
  text,
  onClick,
  type = "button",
  bgColor = "#f26a50",
  hoverColor = "#e85a3f",
  shadowColor = "#c94e36",
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  const [isHover, setIsHover] = useState(false);

  const isDisabled = loading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="w-full py-3.5 mt-1.5 rounded-2xl text-white text-sm font-bold border-none"
      style={{
        background: isDisabled ? "#999" : isHover ? hoverColor : bgColor,
        boxShadow: isDisabled
          ? "none"
          : isHover
            ? `0 2px 0px ${shadowColor}, 0 6px 15px rgba(0,0,0,0.2)`
            : `0 4px 0px ${shadowColor}, 0 8px 20px rgba(242,106,80,0.28)`,
        transform: isHover && !isDisabled ? "translateY(2px)" : "translateY(0)",
        transition: "all 0.14s ease",
        fontFamily: "inherit",
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Please wait..." : text}
    </button>
  );
}

export default PrimaryButton;
