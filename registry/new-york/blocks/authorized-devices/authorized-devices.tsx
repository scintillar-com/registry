"use client"

import { Monitor, Smartphone, Globe, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { FormSection } from "../form-section/form-section"

export interface AuthorizedDevice {
  /** Unique device identifier. */
  id: string
  /** Device name or model. */
  name: string
  /** Browser name (e.g., "Chrome 120"). */
  browser: string
  /** Operating system (e.g., "macOS 14"). */
  os: string
  /** Approximate location (e.g., "Montreal, CA"). */
  location: string
  /** Last active timestamp as an ISO string or display string. */
  lastActive: string
  /** Whether this is the device the user is currently using. */
  current?: boolean
}

export interface AuthorizedDevicesProps {
  /** List of authorized devices. */
  devices?: AuthorizedDevice[]
  /** Called when the user revokes access for a device. */
  onRevoke?: (deviceId: string) => void
  /** Additional CSS classes. */
  className?: string
}

/**
 * A device management section showing all authorized devices.
 * Displays device name, browser/OS, location, last active time,
 * and allows revoking non-current devices.
 * Uses FormSection for consistent layout.
 */
export function AuthorizedDevices({
  devices = [],
  onRevoke,
  className,
}: AuthorizedDevicesProps) {
  return (
    <div className={className}>
      <FormSection
        title="Authorized devices"
        description="Manage devices that are signed in to your account."
      >
        {devices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No devices found.
          </p>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className={cn(
                  "flex items-center gap-4 rounded-lg border p-4",
                  device.current && "border-primary/30 bg-primary/5"
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {device.os.toLowerCase().includes("android") ||
                  device.os.toLowerCase().includes("ios") ? (
                    <Smartphone className="size-5" />
                  ) : (
                    <Monitor className="size-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {device.name}
                    </p>
                    {device.current && (
                      <Badge variant="secondary" className="shrink-0">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{device.browser} / {device.os}</span>
                    <span className="flex items-center gap-1">
                      <Globe className="size-3" />
                      {device.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {device.lastActive}
                    </span>
                  </div>
                </div>

                {!device.current && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRevoke?.(device.id)}
                    className="shrink-0"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </FormSection>
    </div>
  )
}
