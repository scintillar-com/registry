"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

/** User presence status. */
export type StatusType = "online" | "offline" | "busy" | "away"

const statusColors: Record<StatusType, string> = {
  online: "bg-green-500",
  offline: "bg-muted-foreground/40",
  busy: "bg-destructive",
  away: "bg-amber-500",
}

const statusLabels: Record<StatusType, string> = {
  online: "Online",
  offline: "Offline",
  busy: "Busy",
  away: "Away",
}

export interface UserStatusProps {
  /** User display name. */
  name: string
  /** Subtitle (e.g., role, email, team). */
  subtitle?: string
  /** Avatar image URL. */
  avatarUrl?: string
  /** Avatar fallback initials. */
  initials?: string
  /** Presence status. */
  status?: StatusType
  /** Avatar size. */
  size?: "sm" | "default" | "lg"
  /** Additional CSS classes. */
  className?: string
}

/** Displays a user avatar with name, subtitle, and presence status indicator. */
export function UserStatus({
  name,
  subtitle,
  avatarUrl,
  initials,
  status,
  size = "default",
  className,
}: UserStatusProps) {
  const avatarSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "default"

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Avatar size={avatarSize}>
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback>
            {initials ?? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-2 border-background",
              statusColors[status],
              size === "sm" ? "size-2" : size === "lg" ? "size-3.5" : "size-2.5"
            )}
            aria-label={statusLabels[status]}
          />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-medium truncate",
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
          )}
        >
          {name}
        </p>
        {subtitle && (
          <p
            className={cn(
              "text-muted-foreground truncate",
              size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : "text-xs"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
