import { useState } from "react";

interface PrimaryButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit";
  bgColor?: string;
  hoverColor?: string;
  shadowColor?: string;
}

function PrimaryButton({
  text,
  onClick,
  type = "button",
  bgColor = "#f26a50",
  hoverColor = "#e85a3f",
  shadowColor = "#c94e36",
}: PrimaryButtonProps) {
  const [isHover, setIsHover] = useState(false);

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="w-full py-3.5 mt-1.5 rounded-2xl text-white text-sm font-bold cursor-pointer border-none"
      style={{
        background: isHover ? hoverColor : bgColor,
        boxShadow: isHover
          ? `0 2px 0px ${shadowColor}, 0 6px 15px rgba(0,0,0,0.2)`
          : `0 4px 0px ${shadowColor}, 0 8px 20px rgba(242,106,80,0.28)`,
        transform: isHover ? "translateY(2px)" : "translateY(0)",
        transition: "all 0.14s ease",
        fontFamily: "inherit",
      }}
    >
      {text}
    </button>
  );
}

export default PrimaryButton;
