import { cn } from "@/lib/utils";

type Status = "lost" | "found" | "matched" | "resolved";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  lost: {
    label: "Lost",
    className: "bg-lost text-lost-foreground",
  },
  found: {
    label: "Found",
    className: "bg-found text-found-foreground",
  },
  matched: {
    label: "Match Found",
    className: "bg-matched text-matched-foreground",
  },
  resolved: {
    label: "Resolved",
    className: "bg-muted text-muted-foreground",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
