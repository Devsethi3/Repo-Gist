import React, { useState } from "react";

interface AvatarProps {
  src: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md" }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getColorFromName = (name: string) => {
    const colors = [
      "bg-primary",
      "bg-secondary",
      "bg-accent",
      "bg-primary/80",
      "bg-secondary/80",
    ];
    const index = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (hasError || !src) {
    return (
      <div
        className={`${sizeClasses[size]} ${getColorFromName(
          name
        )} rounded-full flex items-center justify-center text-primary-foreground font-medium shrink-0`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative shrink-0`}>
      {isLoading && (
        <div
          className={`absolute inset-0 rounded-full bg-muted animate-pulse`}
        />
      )}
      <img
        src={src}
        alt={name}
        className={`w-full h-full rounded-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default Avatar;
