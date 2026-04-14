"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function CalendarPreview() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <PreviewLayout>
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border w-fit"
    />
    </PreviewLayout>
  )
}
