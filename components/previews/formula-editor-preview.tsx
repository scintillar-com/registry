"use client"

import { useState } from "react"
import { FormulaEditor, FormulaDisplay } from "@/registry/new-york/blocks/formula-editor/formula-editor"
import { evaluateFormula } from "@/lib/formula"
import { PreviewLayout } from "@sntlr/registry-shell/shell/components/preview-layout"
import { Button } from "@/components/ui/button"

const FIELDS = ["Price", "Tax", "Quantity", "Name", "Due Date"]
const FIELD_TYPES: Record<string, string> = {
  Price: "number",
  Tax: "number",
  Quantity: "number",
  Name: "text",
  "Due Date": "date",
}
const FIELD_VALUES: Record<string, unknown> = {
  Price: 100,
  Tax: 15,
  Quantity: 3,
  Name: "Widget",
  "Due Date": "2025-06-15",
}

export function FormulaEditorPreview() {
  const [formula, setFormula] = useState("=add({Price}, {Tax})")
  const [editing, setEditing] = useState(false)

  const result = formula.startsWith("=")
    ? evaluateFormula(formula, FIELD_VALUES)
    : null

  return (
    <PreviewLayout>
      <div className="space-y-3 w-80">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Formula</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border px-3 py-2 bg-background">
              <FormulaDisplay formula={formula} fieldNames={FIELDS} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? "Close" : "Edit"}
            </Button>
          </div>
        </div>

        {result !== null && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Result</p>
            <div className="rounded-md border px-3 py-2 bg-muted/30 font-mono text-sm">
              {String(result)}
            </div>
          </div>
        )}

        {editing && (
          <FormulaEditor
            value={formula}
            onChange={setFormula}
            onBlur={() => setEditing(false)}
            fieldNames={FIELDS}
            fieldTypes={FIELD_TYPES}
            inline
          />
        )}
      </div>
    </PreviewLayout>
  )
}
