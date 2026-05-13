import { MapPin, Monitor } from "lucide-react";

export function LocationBadge({
  locationType,
  size = 13,
  className = "text-sm text-neutral-500",
}: {
  locationType: "onsite" | "online";
  size?: number;
  className?: string;
}) {
  const Icon = locationType === "online" ? Monitor : MapPin;
  const label = locationType === "online" ? "Online" : "Osobne";
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Icon size={size} className="shrink-0" />
      <span>{label}</span>
    </div>
  );
}
