"use client"

import { useState, useMemo } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"

/** Password strength level. */
export type PasswordStrength = "weak" | "fair" | "good" | "strong"

/** Severity presets — higher severity requires more entropy for "strong". */
export type PasswordSeverity = "low" | "medium" | "high"

const severityThresholds: Record<PasswordSeverity, { fair: number; good: number; strong: number }> = {
  low: { fair: 30, good: 50, strong: 65 },
  medium: { fair: 40, good: 60, strong: 80 },
  high: { fair: 50, good: 75, strong: 95 },
}

/** Estimate password entropy (bits). Higher = stronger. */
function estimateEntropy(password: string): number {
  if (password.length === 0) return 0

  let poolSize = 0
  if (/[a-z]/.test(password)) poolSize += 26
  if (/[A-Z]/.test(password)) poolSize += 26
  if (/\d/.test(password)) poolSize += 10
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32

  let entropy = password.length * Math.log2(Math.max(poolSize, 1))

  // Penalize repetitions (e.g., "aaaa", "1111")
  const repMatch = password.match(/(.)\1{2,}/g)
  if (repMatch) {
    for (const rep of repMatch) {
      entropy -= (rep.length - 1) * 3
    }
  }

  // Penalize sequential characters (e.g., "abcd", "1234")
  let seqCount = 0
  for (let i = 1; i < password.length; i++) {
    const diff = password.charCodeAt(i) - password.charCodeAt(i - 1)
    if (diff === 1 || diff === -1) seqCount++
    else seqCount = 0
    if (seqCount >= 2) entropy -= 2
  }

  // Penalize common patterns
  const lower = password.toLowerCase()
  const commonPatterns = [
    "password", "123456", "qwerty", "abc123", "letmein",
    "admin", "welcome", "monkey", "master", "dragon",
  ]
  for (const pattern of commonPatterns) {
    if (lower.includes(pattern)) entropy *= 0.3
  }

  return Math.max(0, entropy)
}

/** Evaluate password strength based on entropy estimation. */
export function getPasswordStrength(
  password: string,
  severity: PasswordSeverity = "medium"
): {
  strength: PasswordStrength
  entropy: number
  segments: number
} {
  const entropy = estimateEntropy(password)
  const t = severityThresholds[severity]

  let strength: PasswordStrength = "weak"
  let segments = 1
  if (entropy >= t.strong) { strength = "strong"; segments = 4 }
  else if (entropy >= t.good) { strength = "good"; segments = 3 }
  else if (entropy >= t.fair) { strength = "fair"; segments = 2 }

  return { strength, entropy, segments }
}

const strengthColors: Record<PasswordStrength, string> = {
  weak: "bg-destructive",
  fair: "bg-amber-500",
  good: "bg-blue-500",
  strong: "bg-green-500",
}

const defaultLabels = {
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
  showPassword: "Show password",
  hidePassword: "Hide password",
}

export type PasswordInputLabels = typeof defaultLabels

export interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  /** Show password strength indicator below the input. */
  showStrength?: boolean
  /** How strict the strength evaluation is. Higher severity requires stronger passwords. */
  severity?: PasswordSeverity
  /** Override internal labels for localization. */
  labels?: Partial<PasswordInputLabels>
}

/** A password input with visibility toggle and optional strength indicator. */
export function PasswordInput({
  showStrength = false,
  severity = "medium",
  className,
  value,
  onChange,
  labels,
  ...props
}: PasswordInputProps) {
  const l = { ...defaultLabels, ...labels }
  const [visible, setVisible] = useState(false)
  const [internalValue, setInternalValue] = useState("")

  const currentValue = (value as string) ?? internalValue
  const { strength, segments } = useMemo(
    () => getPasswordStrength(currentValue, severity),
    [currentValue, severity]
  )

  const strengthLabels: Record<PasswordStrength, string> = {
    weak: l.weak,
    fair: l.fair,
    good: l.good,
    strong: l.strong,
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => {
            setInternalValue(e.target.value)
            onChange?.(e)
          }}
          className="pr-10"
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? l.hidePassword : l.showPassword}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>

      {showStrength && currentValue.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i < segments ? strengthColors[strength] : "bg-muted"
                )}
              />
            ))}
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              strength === "weak" && "text-destructive",
              strength === "fair" && "text-amber-500",
              strength === "good" && "text-blue-500",
              strength === "strong" && "text-green-500"
            )}
          >
            {strengthLabels[strength]}
          </span>
        </div>
      )}
    </div>
  )
}
