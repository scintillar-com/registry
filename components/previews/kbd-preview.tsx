"use client"

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function KbdPreview() {
  return (
    <PreviewLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
          <Kbd>Esc</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>Tab</Kbd>
          <Kbd>⇧</Kbd>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Kbd>⇦</Kbd>
          <Kbd>⇨</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>⇩</Kbd>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>C</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>Shift</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
        </div>
      </div>
    </PreviewLayout>
  )
}
