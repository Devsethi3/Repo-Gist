import React from "react";

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 16,
  className = "",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`text-[#1D9BF0] shrink-0 ${className}`}
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10zm-5.97-2.47a.75.75 0 0 0-1.06-1.06l-4.5 4.5-1.94-1.94a.75.75 0 0 0-1.06 1.06l2.47 2.47a.75.75 0 0 0 1.06 0l5.03-5.03z"
      />
    </svg>
  );
};

export default VerifiedBadge;
