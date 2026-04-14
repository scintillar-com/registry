"use client"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function InputOtpPreview() {
  const { values, entries } = useControls({
    maxLength: { type: "number", default: 6, min: 4, max: 8 },
  })

  const half = Math.floor(values.maxLength / 2)

  return (
    <PreviewLayout controls={entries}>
      <InputOTP maxLength={values.maxLength}>
        <InputOTPGroup>
          {Array.from({ length: half }).map((_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          {Array.from({ length: values.maxLength - half }).map((_, i) => (
            <InputOTPSlot key={half + i} index={half + i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </PreviewLayout>
  )
}
