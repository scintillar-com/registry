/**
 * Formula evaluator with field references.
 *
 * Syntax: =FUNCTION(args...)
 * References: field names wrapped in {FieldName}
 *
 * Supported functions:
 *   eq(a, b)         → a == b (returns true/false)
 *   neq(a, b)        → a != b
 *   lt(a, b)         → a < b
 *   gt(a, b)         → a > b
 *   lte(a, b)        → a <= b
 *   gte(a, b)        → a >= b
 *   add(a, b)        → a + b
 *   sub(a, b)        → a - b
 *   mul(a, b)        → a * b
 *   div(a, b)        → a / b (returns 0 if b is 0)
 *   concat(a, b, ..) → concatenate strings
 *   year(date)       → extract year from ISO date
 *   month(date)      → extract month (1-12)
 *   day(date)        → extract day of month
 *   hour(date)       → extract hour (0-23)
 *   if(cond, a, b)   → if cond is truthy, return a, else b
 */

export interface FieldMap {
  [fieldName: string]: unknown
}

function resolveValue(token: string, fields: FieldMap): unknown {
  const trimmed = token.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return fields[trimmed.slice(1, -1)]
  }
  if (trimmed === "true") return true
  if (trimmed === "false") return false
  const num = Number(trimmed)
  if (!isNaN(num) && trimmed !== "") return num
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function toNum(v: unknown): number {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

function toStr(v: unknown): string {
  if (v === null || v === undefined) return ""
  return String(v)
}

function parseFunctionCall(
  expr: string
): { name: string; args: string[] } | null {
  const match = expr.match(/^(\w+)\(([\s\S]*)\)$/)
  if (!match) return null

  const name = match[1].toLowerCase()
  const argsStr = match[2]

  const args: string[] = []
  let depth = 0
  let current = ""
  for (const ch of argsStr) {
    if (ch === "(") depth++
    else if (ch === ")") depth--
    else if (ch === "," && depth === 0) {
      args.push(current.trim())
      current = ""
      continue
    }
    current += ch
  }
  if (current.trim()) args.push(current.trim())

  return { name, args }
}

function evalExpr(expr: string, fields: FieldMap): unknown {
  const trimmed = expr.trim()

  const call = parseFunctionCall(trimmed)
  if (call) {
    const resolvedArgs = call.args.map((a) => evalExpr(a, fields))

    switch (call.name) {
      case "eq":
        return resolvedArgs[0] == resolvedArgs[1]
      case "neq":
        return resolvedArgs[0] != resolvedArgs[1]
      case "lt":
        return toNum(resolvedArgs[0]) < toNum(resolvedArgs[1])
      case "gt":
        return toNum(resolvedArgs[0]) > toNum(resolvedArgs[1])
      case "lte":
        return toNum(resolvedArgs[0]) <= toNum(resolvedArgs[1])
      case "gte":
        return toNum(resolvedArgs[0]) >= toNum(resolvedArgs[1])
      case "add":
        return toNum(resolvedArgs[0]) + toNum(resolvedArgs[1])
      case "sub":
        return toNum(resolvedArgs[0]) - toNum(resolvedArgs[1])
      case "mul":
        return toNum(resolvedArgs[0]) * toNum(resolvedArgs[1])
      case "div": {
        const divisor = toNum(resolvedArgs[1])
        return divisor === 0 ? 0 : toNum(resolvedArgs[0]) / divisor
      }
      case "concat":
        return resolvedArgs.map(toStr).join("")
      case "year": {
        const d = new Date(toStr(resolvedArgs[0]))
        return isNaN(d.getTime()) ? "" : d.getFullYear()
      }
      case "month": {
        const d = new Date(toStr(resolvedArgs[0]))
        return isNaN(d.getTime()) ? "" : d.getMonth() + 1
      }
      case "day": {
        const d = new Date(toStr(resolvedArgs[0]))
        return isNaN(d.getTime()) ? "" : d.getDate()
      }
      case "hour": {
        const d = new Date(toStr(resolvedArgs[0]))
        return isNaN(d.getTime()) ? "" : d.getHours()
      }
      case "if":
        return resolvedArgs[0] ? resolvedArgs[1] : resolvedArgs[2]
      default:
        return `#UNKNOWN(${call.name})`
    }
  }

  return resolveValue(trimmed, fields)
}

/**
 * Evaluate a formula string.
 * Must start with `=`. References use {FieldName}.
 *
 * Examples:
 *   =add({Price}, {Tax})
 *   =concat({First Name}, " ", {Last Name})
 *   =if(gt({Score}, 80), "Pass", "Fail")
 */
export function evaluateFormula(
  formula: string,
  fieldsByName: FieldMap
): unknown {
  if (!formula.startsWith("=")) return formula
  try {
    const expr = formula.slice(1).replace(/\n/g, " ")
    return evalExpr(expr, fieldsByName)
  } catch {
    return "#ERROR"
  }
}

/** Formula function definition for editor UIs */
export interface FormulaFunction {
  name: string
  sig: string
  desc: string
}

/** All available formula functions */
export const FORMULA_FUNCTIONS: FormulaFunction[] = [
  { name: "add", sig: "add(a, b)", desc: "Sum two numbers" },
  { name: "sub", sig: "sub(a, b)", desc: "Subtract b from a" },
  { name: "mul", sig: "mul(a, b)", desc: "Multiply two numbers" },
  { name: "div", sig: "div(a, b)", desc: "Divide a by b" },
  { name: "concat", sig: "concat(a, b, ...)", desc: "Join values as text" },
  { name: "if", sig: "if(cond, then, else)", desc: "Conditional value" },
  { name: "eq", sig: "eq(a, b)", desc: "Equal (true/false)" },
  { name: "neq", sig: "neq(a, b)", desc: "Not equal" },
  { name: "gt", sig: "gt(a, b)", desc: "Greater than" },
  { name: "lt", sig: "lt(a, b)", desc: "Less than" },
  { name: "gte", sig: "gte(a, b)", desc: "Greater or equal" },
  { name: "lte", sig: "lte(a, b)", desc: "Less or equal" },
  { name: "year", sig: "year(date)", desc: "Extract year" },
  { name: "month", sig: "month(date)", desc: "Extract month (1-12)" },
  { name: "day", sig: "day(date)", desc: "Extract day of month" },
  { name: "hour", sig: "hour(date)", desc: "Extract hour (0-23)" },
]

export const FUNC_NAMES: string[] = FORMULA_FUNCTIONS.map((f) => f.name)
