"use client"

import { useState } from "react"
import { LiveCaret } from "@/components/ui/live-caret"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

const words = "The quick brown fox jumps over the lazy dog and runs across the field".split(" ")

export function LiveCaretPreview() {
  const { values, entries } = useControls({
    name: { type: "text", default: "Alice" },
    color: { type: "text", default: "#6366f1" },
  })

  const [caretIndex, setCaretIndex] = useState(5)

  return (
    <PreviewLayout controls={entries}>
      <p className="text-sm leading-relaxed max-w-xs select-none">
        {words.map((word, i) => (
          <span key={i}>
            {i === caretIndex && (
              <LiveCaret name={values.name} color={values.color} />
            )}
            <span
              className="cursor-text hover:bg-accent/30 rounded-sm px-px transition-colors"
              onClick={() => setCaretIndex(i)}
            >
              {word}
            </span>
            {" "}
          </span>
        ))}
        <span className="block mt-2 text-[10px] text-muted-foreground">
          Click a word to move the caret
        </span>
      </p>
    </PreviewLayout>
  )
}
