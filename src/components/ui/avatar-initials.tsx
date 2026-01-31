import { cn } from "@/lib/utils";

interface AvatarInitialsProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  withGradientRing?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

const getInitials = (name: string): string => {
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getColorFromName = (name: string): string => {
  const colors = [
    "bg-accent",
    "bg-lost",
    "bg-found",
    "bg-matched",
    "bg-primary",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export function AvatarInitials({
  name,
  className,
  size = "md",
  withGradientRing = false,
}: AvatarInitialsProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  const avatar = (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white",
        bgColor,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );

  if (withGradientRing) {
    return <div className="avatar-ring">{avatar}</div>;
  }

  return avatar;
}
