"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { FORMULA_FUNCTIONS, FUNC_NAMES, type FormulaFunction } from "../../../../lib/formula"

// ── Type checking ───────────────────────────────────────────────

type ValType = "number" | "string" | "boolean" | "date"

function propertyTypeToValType(propType: string): ValType {
  switch (propType) {
    case "number": case "formula": return "number"
    case "date": return "date"
    case "checkbox": return "boolean"
    default: return "string"
  }
}

interface FuncSpec {
  minArgs: number
  maxArgs?: number
  argTypes?: ValType[][]
  returns: ValType
}

const FUNC_SPECS: Record<string, FuncSpec> = {
  add:    { minArgs: 2, maxArgs: 2, argTypes: [["number"], ["number"]], returns: "number" },
  sub:    { minArgs: 2, maxArgs: 2, argTypes: [["number"], ["number"]], returns: "number" },
  mul:    { minArgs: 2, maxArgs: 2, argTypes: [["number"], ["number"]], returns: "number" },
  div:    { minArgs: 2, maxArgs: 2, argTypes: [["number"], ["number"]], returns: "number" },
  concat: { minArgs: 1, returns: "string" },
  if:     { minArgs: 3, maxArgs: 3, returns: "string" },
  eq:     { minArgs: 2, maxArgs: 2, returns: "boolean" },
  neq:    { minArgs: 2, maxArgs: 2, returns: "boolean" },
  gt:     { minArgs: 2, maxArgs: 2, argTypes: [["number"], ["number"]], returns: "boolean" },
  lt:     { minArgs: 2, maxArgs: 2, argTypes: [["number"], ["number"]], returns: "boolean" },
  gte:    { minArgs: 2, maxArgs: 2, argTypes: [["number"], ["number"]], returns: "boolean" },
  lte:    { minArgs: 2, maxArgs: 2, argTypes: [["number"], ["number"]], returns: "boolean" },
  year:   { minArgs: 1, maxArgs: 1, argTypes: [["date"]], returns: "number" },
  month:  { minArgs: 1, maxArgs: 1, argTypes: [["date"]], returns: "number" },
  day:    { minArgs: 1, maxArgs: 1, argTypes: [["date"]], returns: "number" },
  hour:   { minArgs: 1, maxArgs: 1, argTypes: [["date"]], returns: "number" },
}

function inferArgType(arg: string, fieldTypes: Record<string, string>): ValType | null {
  const t = arg.trim()
  if (!t) return null
  const fieldMatch = t.match(/^\{([^}]+)\}$/)
  if (fieldMatch) {
    const propType = fieldTypes[fieldMatch[1]]
    return propType ? propertyTypeToValType(propType) : null
  }
  const fnMatch = t.match(/^(\w+)\(/)
  if (fnMatch) {
    const spec = FUNC_SPECS[fnMatch[1].toLowerCase()]
    return spec?.returns ?? null
  }
  if (t === "true" || t === "false") return "boolean"
  if (/^-?\d+(\.\d+)?$/.test(t)) return "number"
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return "string"
  return null
}

const TYPE_LABELS: Record<ValType, string> = { number: "number", string: "text", boolean: "boolean", date: "date" }

// ── Validation ──────────────────────────────────────────────────

interface FormulaDiagnostic {
  level: "error" | "warning"
  message: string
}

function splitArgs(argsStr: string): string[] {
  const args: string[] = []
  let depth = 0
  let current = ""
  for (const ch of argsStr) {
    if (ch === "(") depth++
    else if (ch === ")") depth--
    else if (ch === "," && depth === 0) { args.push(current); current = ""; continue }
    current += ch
  }
  if (current.trim()) args.push(current)
  return args
}

function extractFunctionCalls(expr: string): { name: string; args: string[]; argCount: number }[] {
  const results: { name: string; args: string[]; argCount: number }[] = []
  function parse(e: string) {
    const trimmed = e.trim()
    const fnMatch = trimmed.match(/^(\w+)\(([\s\S]*)\)$/)
    if (!fnMatch) return
    const name = fnMatch[1]
    const argsStr = fnMatch[2]
    const args = splitArgs(argsStr)
    results.push({ name, args, argCount: argsStr.trim() === "" ? 0 : args.length })
    for (const a of args) parse(a.trim())
  }
  parse(expr)
  return results
}

function closestMatch(input: string, candidates: string[]): string | null {
  const lower = input.toLowerCase()
  return candidates.find((c) => c.toLowerCase().startsWith(lower)) ??
    candidates.find((c) => c.toLowerCase().includes(lower)) ?? null
}

function validateFormula(formula: string, fieldNames: string[], fieldTypes: Record<string, string>): FormulaDiagnostic[] {
  if (!formula.trim()) return []
  const diagnostics: FormulaDiagnostic[] = []

  if (!formula.startsWith("=")) {
    diagnostics.push({ level: "error", message: "Formula must start with = (e.g. =add(1, 2))" })
    return diagnostics
  }

  const expr = formula.slice(1).replace(/\n/g, " ")
  if (!expr.trim()) {
    diagnostics.push({ level: "warning", message: "Empty formula — type a function like add(), concat(), if()" })
    return diagnostics
  }

  let depth = 0
  for (const ch of expr) {
    if (ch === "(") depth++
    if (ch === ")") depth--
    if (depth < 0) break
  }
  if (depth > 0) diagnostics.push({ level: "error", message: `Missing ${depth} closing parenthes${depth > 1 ? "es" : "is"} )` })
  if (depth < 0) diagnostics.push({ level: "error", message: "Extra closing parenthesis )" })

  const calls = extractFunctionCalls(expr)
  for (const call of calls) {
    const lower = call.name.toLowerCase()
    if (!FUNC_NAMES.includes(lower)) {
      diagnostics.push({ level: "error", message: `Unknown function "${call.name}" — did you mean ${closestMatch(call.name, FUNC_NAMES)}?` })
      continue
    }
    const spec = FUNC_SPECS[lower]
    if (spec) {
      if (call.argCount < spec.minArgs) diagnostics.push({ level: "error", message: `${lower}() expects at least ${spec.minArgs} argument${spec.minArgs > 1 ? "s" : ""}, got ${call.argCount}` })
      else if (spec.maxArgs !== undefined && call.argCount > spec.maxArgs) diagnostics.push({ level: "error", message: `${lower}() expects at most ${spec.maxArgs} argument${spec.maxArgs > 1 ? "s" : ""}, got ${call.argCount}` })
      if (spec.argTypes && call.args.length > 0) {
        for (let i = 0; i < call.args.length && i < spec.argTypes.length; i++) {
          const expected = spec.argTypes[i]
          const argType = inferArgType(call.args[i], fieldTypes)
          if (expected && argType && !expected.includes(argType)) {
            const argStr = call.args[i].trim()
            const fieldRef = argStr.match(/^\{([^}]+)\}$/)
            const source = fieldRef ? `field {${fieldRef[1]}} (${TYPE_LABELS[argType]})` : `${TYPE_LABELS[argType]} "${argStr}"`
            diagnostics.push({ level: "error", message: `${lower}() argument ${i + 1}: expected ${expected.map((t) => TYPE_LABELS[t]).join(" or ")}, got ${source}` })
          }
        }
      }
    }
  }

  const fieldRe = /\{([^}]+)\}/g
  let m
  while ((m = fieldRe.exec(expr)) !== null) {
    if (!fieldNames.includes(m[1])) {
      const suggestion = closestMatch(m[1], fieldNames)
      diagnostics.push({
        level: "error",
        message: suggestion
          ? `Unknown field "{${m[1]}}" — did you mean {${suggestion}}?`
          : `Unknown field "{${m[1]}}" — available: ${fieldNames.length > 0 ? fieldNames.slice(0, 4).map((n) => `{${n}}`).join(", ") : "none defined"}`,
      })
    }
  }

  if (expr.match(/\{[^}]*$/)) diagnostics.push({ level: "error", message: "Unclosed field reference — add a closing }" })

  const stripped = expr.replace(/"[^"]*"|'[^']*'/g, "").replace(/\{[^}]*\}/g, "").replace(/\w+\(/g, "(")
  const bareWordRe = /\b([a-zA-Z_]\w*)\b/g
  const seen = new Set<string>()
  let bm
  while ((bm = bareWordRe.exec(stripped)) !== null) {
    const word = bm[1]
    if (word === "true" || word === "false" || seen.has(word)) continue
    seen.add(word)
    const suggestion = closestMatch(word, fieldNames)
    diagnostics.push({
      level: "error",
      message: suggestion ? `Unknown variable "${word}" — did you mean {${suggestion}}?` : `Unknown variable "${word}" — use {${word}} to reference a field`,
    })
  }

  return diagnostics
}

// ── Syntax highlighting ─────────────────────────────────────────

const C_FUNC = "text-purple-500 dark:text-purple-400"
const C_VAR = "text-orange-500 dark:text-orange-400"
const C_STR = "text-teal-500 dark:text-teal-400"
const C_NUM = "text-amber-600 dark:text-amber-400"
const C_PUNC = "text-muted-foreground"
const C_ERR = "text-destructive"

function highlightFormula(formula: string, fieldNames: string[]): React.ReactNode[] {
  if (!formula.startsWith("=")) return [formula]
  const parts: React.ReactNode[] = []
  parts.push(<span key="eq" className={C_PUNC}>=</span>)
  const text = formula.slice(1)
  let pos = 0

  while (pos < text.length) {
    if (text[pos] === "{") {
      const end = text.indexOf("}", pos)
      if (end > pos) {
        const ref = text.slice(pos, end + 1)
        const name = text.slice(pos + 1, end)
        parts.push(<span key={`f${pos}`} className={fieldNames.includes(name) ? C_VAR : C_ERR}>{ref}</span>)
        pos = end + 1; continue
      }
    }
    const remaining = text.slice(pos)
    const funcMatch = remaining.match(/^(\w+)(?=\()/)
    if (funcMatch) {
      const fn = funcMatch[1]
      parts.push(<span key={`fn${pos}`} className={cn(FUNC_NAMES.includes(fn.toLowerCase()) ? C_FUNC : C_ERR, "font-medium")}>{fn}</span>)
      pos += fn.length; continue
    }
    if (text[pos] === '"' || text[pos] === "'") {
      const quote = text[pos]
      const end = text.indexOf(quote, pos + 1)
      if (end > pos) { parts.push(<span key={`s${pos}`} className={C_STR}>{text.slice(pos, end + 1)}</span>); pos = end + 1; continue }
    }
    const numMatch = remaining.match(/^\d+(\.\d+)?/)
    if (numMatch && (pos === 0 || /[,()\s]/.test(text[pos - 1] ?? ""))) {
      parts.push(<span key={`n${pos}`} className={C_NUM}>{numMatch[0]}</span>); pos += numMatch[0].length; continue
    }
    if ("(),".includes(text[pos])) { parts.push(<span key={`p${pos}`} className={C_PUNC}>{text[pos]}</span>); pos++; continue }
    const wordMatch = remaining.match(/^(\w+)/)
    if (wordMatch) {
      const word = wordMatch[1]
      const isConst = word === "true" || word === "false"
      parts.push(<span key={`w${pos}`} className={isConst ? C_NUM : C_ERR}>{word}</span>); pos += word.length; continue
    }
    parts.push(<span key={`d${pos}`}>{text[pos]}</span>); pos++
  }
  return parts
}

function highlightSig(sig: string): React.ReactNode {
  const m = sig.match(/^(\w+)\((.+)\)$/)
  if (!m) return sig
  return (<><span className={cn(C_FUNC, "font-medium")}>{m[1]}</span><span className={C_PUNC}>(</span><span className={C_VAR}>{m[2]}</span><span className={C_PUNC}>)</span></>)
}

// ── FormulaEditor ───────────────────────────────────────────────

export interface FormulaEditorProps {
  /** The formula expression string (e.g. "=add({Price}, {Tax})"). */
  value: string
  /** Called on every keystroke with the updated formula. */
  onChange: (val: string) => void
  /** Called when the editor should close (Escape, Ctrl+Enter, or outside click). */
  onBlur: () => void
  /** Available field names for autocomplete and validation. */
  fieldNames: string[]
  /** Map of field name to property type (e.g. "number", "date", "text") for type checking. */
  fieldTypes?: Record<string, string>
  /** Render inline instead of as a floating dialog. Use this inside transformed containers (e.g. preview canvases). */
  inline?: boolean
  /** Additional CSS classes for the anchor element. */
  className?: string
}

/**
 * Interactive formula editor with syntax highlighting, inline validation,
 * autocomplete for functions and field references, and keyboard navigation.
 */
export function FormulaEditor({ value, onChange, onBlur, fieldNames, fieldTypes = {}, inline = false, className }: FormulaEditorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [query, setQuery] = useState("")
  const [suggestionType, setSuggestionType] = useState<"function" | "field">("function")
  const [contextFunc, setContextFunc] = useState<FormulaFunction | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({})

  useLayoutEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const dialogW = Math.min(380, vw - 32)
    const dialogH = 220
    const p: typeof pos = {}
    if (rect.bottom + dialogH + 8 < vh) p.top = rect.bottom + 4
    else p.bottom = vh - rect.top + 4
    if (rect.left + dialogW < vw) p.left = rect.left
    else p.right = vw - rect.right
    // eslint-disable-next-line react-hooks/set-state-in-effect -- compute position from DOM on mount
    setPos(p)
  }, [])

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) onBlur()
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [onBlur])

  useEffect(() => {
    const el = inputRef.current
    if (el) { el.focus(); el.style.height = "auto"; el.style.height = `${el.scrollHeight}px` }
  }, [])

  function findEnclosingFunc(before: string): FormulaFunction | null {
    let depth = 0
    for (let i = before.length - 1; i >= 0; i--) {
      if (before[i] === ")") depth++
      if (before[i] === "(") {
        if (depth === 0) {
          const nameMatch = before.slice(0, i).match(/(\w+)$/)
          if (nameMatch) return FORMULA_FUNCTIONS.find((f) => f.name === nameMatch[1].toLowerCase()) ?? null
          return null
        }
        depth--
      }
    }
    return null
  }

  function updateSuggestions(val: string, cursorPos: number) {
    const before = val.slice(0, cursorPos)
    setContextFunc(findEnclosingFunc(before))
    const fieldMatch = before.match(/\{([^}]*)$/)
    if (fieldMatch) { setQuery(fieldMatch[1].toLowerCase()); setSuggestionType("field"); setShowSuggestions(true); setSelectedIdx(0); return }
    const funcMatch = before.match(/(?:^=|[,(])?\s*(\w*)$/)
    if (funcMatch && funcMatch[1] && val.startsWith("=")) { setQuery(funcMatch[1].toLowerCase()); setSuggestionType("function"); setShowSuggestions(true); setSelectedIdx(0); return }
    setShowSuggestions(false)
  }

  const filteredFunctions = query ? FORMULA_FUNCTIONS.filter((f) => f.name.startsWith(query)) : FORMULA_FUNCTIONS
  const filteredFields = query ? fieldNames.filter((f) => f.toLowerCase().includes(query)) : fieldNames
  const suggestions = suggestionType === "function"
    ? filteredFunctions.map((f) => ({ id: f.name, label: f.sig, desc: f.desc }))
    : filteredFields.map((f) => ({ id: f, label: `{${f}}`, desc: "Field reference" }))

  function insertSuggestion(item: { id: string }) {
    const el = inputRef.current
    if (!el) return
    const cursorPos = el.selectionStart ?? value.length
    const before = value.slice(0, cursorPos)
    const after = value.slice(cursorPos)
    if (suggestionType === "field") {
      const braceIdx = before.lastIndexOf("{")
      onChange(before.slice(0, braceIdx) + `{${item.id}}` + after)
    } else {
      const match = before.match(/(\w*)$/)
      const replaceFrom = cursorPos - (match?.[1]?.length ?? 0)
      onChange(before.slice(0, replaceFrom) + item.id + "(" + after)
    }
    setShowSuggestions(false)
    setTimeout(() => el.focus(), 0)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => (i + 1) % suggestions.length); return }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => (i + suggestions.length - 1) % suggestions.length); return }
      if (e.key === "Tab" || (e.key === "Enter" && suggestions.length > 0)) { e.preventDefault(); insertSuggestion(suggestions[selectedIdx]); return }
      if (e.key === "Escape") { e.preventDefault(); setShowSuggestions(false); return }
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !showSuggestions) { e.preventDefault(); onBlur() }
    if (e.key === "Escape" && !showSuggestions) { e.preventDefault(); onBlur() }
  }

  const dialogCn = inline
    ? "relative w-full rounded-lg border bg-popover shadow-xl"
    : "fixed z-50 w-[min(380px,calc(100vw-2rem))] rounded-lg border bg-popover shadow-xl"

  return (
    <>
      {!inline && <div ref={anchorRef} className={cn("w-full h-0", className)} />}
      <div ref={dialogRef} className={dialogCn} style={inline ? undefined : { ...pos }}>
        <div className="relative px-3 py-2.5 border-b">
          <div className="pointer-events-none absolute inset-x-3 inset-y-2.5 font-mono text-sm whitespace-pre-wrap break-words" aria-hidden>
            {highlightFormula(value, fieldNames)}
          </div>
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              updateSuggestions(e.target.value, e.target.selectionStart ?? e.target.value.length)
              e.target.style.height = "auto"
              e.target.style.height = `${e.target.scrollHeight}px`
            }}
            onClick={(e) => updateSuggestions(value, (e.target as HTMLTextAreaElement).selectionStart ?? value.length)}
            onKeyDown={handleKeyDown}
            placeholder="=add({Price}, {Tax})"
            className="w-full bg-transparent outline-none font-mono text-sm text-transparent caret-foreground resize-none overflow-hidden"
            rows={1}
            style={{ minHeight: "1.75rem" }}
            spellCheck={false}
          />
        </div>

        {contextFunc && !showSuggestions && (
          <div className="px-3 py-1.5 border-b bg-muted/30 flex items-center gap-2">
            <span className="font-mono text-xs">{highlightSig(contextFunc.sig)}</span>
            <span className="text-[11px] text-muted-foreground">{contextFunc.desc}</span>
          </div>
        )}

        {(() => {
          const diags = validateFormula(value, fieldNames, fieldTypes)
          if (diags.length === 0) return null
          return (
            <div className="px-3 py-2 border-b space-y-1">
              {diags.map((d, i) => (
                <p key={i} className={cn("text-xs flex items-start gap-1.5", d.level === "error" ? "text-destructive" : "text-amber-600 dark:text-amber-400")}>
                  <span className="shrink-0 mt-0.5">{d.level === "error" ? "✕" : "⚠"}</span>
                  <span>{d.message}</span>
                </p>
              ))}
            </div>
          )
        })()}

        {showSuggestions && suggestions.length > 0 && (
          <div className="max-h-48 overflow-y-auto py-1">
            {suggestions.map((item, i) => (
              <button
                key={item.id}
                onMouseDown={(e) => { e.preventDefault(); insertSuggestion(item) }}
                className={cn("flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left transition-colors cursor-pointer", i === selectedIdx ? "bg-muted" : "hover:bg-muted/50")}
              >
                <span className="font-mono shrink-0">
                  {suggestionType === "function" ? highlightSig(item.label) : <span className={C_VAR}>{item.label}</span>}
                </span>
                <span className="text-muted-foreground truncate">{item.desc}</span>
              </button>
            ))}
          </div>
        )}

        <div className="px-3 py-1.5 border-t text-[10px] text-muted-foreground flex items-center gap-3">
          <span><kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Tab</kbd> accept</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">{"{"}</kbd> field ref</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Ctrl+↵</kbd> save</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </>
  )
}

/** Read-only formula display with syntax highlighting */
export function FormulaDisplay({ /** The formula expression string to display. */ formula, /** Available field names for syntax highlighting validation. */ fieldNames }: { formula: string; fieldNames: string[] }) {
  return <span className="font-mono text-xs">{highlightFormula(formula, fieldNames)}</span>
}
