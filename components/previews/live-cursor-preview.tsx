"use client"

import { useRef, useState } from "react"
import { LiveCursor } from "@/components/ui/live-cursor"
import { useControls } from "@sntlr/registry-shell/shell/hooks/use-controls"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"

export function LiveCursorPreview() {
  const { values, entries } = useControls({
    name: { type: "text", default: "Bob" },
    color: { type: "text", default: "#f43f5e" },
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 80, y: 60 })
  const [inside, setInside] = useState(false)

  return (
    <PreviewLayout controls={entries}>
      <div
        ref={containerRef}
        className="relative w-72 h-40 rounded-lg border border-dashed border-border bg-muted/20 cursor-none overflow-hidden"
        onMouseMove={(e) => {
          const rect = containerRef.current?.getBoundingClientRect()
          if (!rect) return
          setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
          setInside(true)
        }}
        onMouseLeave={() => setInside(false)}
        onMouseEnter={() => setInside(true)}
      >
        <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none select-none">
          Move your cursor here
        </p>
        {inside && (
          <LiveCursor
            name={values.name}
            color={values.color}
            x={pos.x}
            y={pos.y}
            absolute
          />
        )}
      </div>
    </PreviewLayout>
  )
}
