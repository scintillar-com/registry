"use client"

import { Shield, ShieldCheck, Smartphone, KeyRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { FormSection } from "../form-section/form-section"

export interface MfaFormProps {
  /** Whether MFA is currently enabled. */
  enabled?: boolean
  /** Called when the user toggles MFA on or off. */
  onToggle?: (enabled: boolean) => void
  /** Called when the user initiates MFA setup or reconfiguration. */
  onSetup?: () => void
  /** The currently active MFA method, or null if none. */
  method?: "app" | "sms" | null
  /** Additional CSS classes. */
  className?: string
}

const methodLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  app: { label: "Authenticator app", icon: <KeyRound className="size-4" /> },
  sms: { label: "SMS", icon: <Smartphone className="size-4" /> },
}

/**
 * A multi-factor authentication configuration section.
 * Shows the current MFA status and allows enabling, disabling, or reconfiguring MFA.
 * Uses FormSection for consistent layout.
 */
export function MfaForm({
  enabled = false,
  onToggle,
  onSetup,
  method = null,
  className,
}: MfaFormProps) {
  const methodInfo = method ? methodLabels[method] : null

  return (
    <div className={className}>
      <FormSection
        title="Two-factor authentication"
        description="Add an extra layer of security to your account."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                enabled
                  ? "bg-green-500/10 text-green-600"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {enabled ? (
                <ShieldCheck className="size-5" />
              ) : (
                <Shield className="size-5" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  {enabled ? "MFA is enabled" : "MFA is disabled"}
                </p>
                <Badge variant={enabled ? "default" : "secondary"}>
                  {enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
              {enabled && methodInfo && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {methodInfo.icon}
                  {methodInfo.label}
                </p>
              )}
              {!enabled && (
                <p className="text-sm text-muted-foreground">
                  Protect your account with a second verification step.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {enabled ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSetup}
                >
                  Reconfigure
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onToggle?.(false)}
                >
                  Disable
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => onSetup?.()}>
                Set up MFA
              </Button>
            )}
          </div>
        </div>
      </FormSection>
    </div>
  )
}
