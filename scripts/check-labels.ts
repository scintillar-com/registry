import fs from "node:fs"
import path from "node:path"

/**
 * Scan component files for potential un-externalized hardcoded strings.
 *
 * For components that define a `defaultLabels` object, verify that
 * user-visible JSX text matches one of the label values. Strings that
 * do not match are reported as warnings (not errors).
 */

const ROOT = process.cwd()

const SCAN_DIRS = [
  path.join(ROOT, "components", "ui"),
  path.join(ROOT, "registry", "new-york", "blocks"),
]

// ── helpers ──────────────────────────────────────────────────────────────────

/** Recursively collect .tsx files. */
function collectTsx(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectTsx(full))
    } else if (entry.name.endsWith(".tsx")) {
      results.push(full)
    }
  }
  return results
}

/** Extract the values from a `defaultLabels = { ... } as const` block. */
function extractDefaultLabels(source: string): string[] | null {
  const match = source.match(
    /const\s+defaultLabels\s*=\s*\{([\s\S]+?)\}\s*as\s+const/
  )
  if (!match) return null

  const body = match[1]
  const values: string[] = []
  // Match string values (single or double quoted)
  for (const m of body.matchAll(/:\s*["']([^"']+)["']/g)) {
    values.push(m[1])
  }
  return values
}

/** Return potential user-visible text from JSX. */
function extractJsxTextCandidates(source: string): { text: string; line: number }[] {
  const results: { text: string; line: number }[] = []
  const lines = source.split("\n")

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip comments
    if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue

    // Pattern 1: text between > and < on the same line (JSX children)
    for (const m of line.matchAll(/>([^<>{]+)</g)) {
      const text = m[1].trim()
      if (isCandidate(text)) {
        results.push({ text, line: i + 1 })
      }
    }

    // Pattern 2: {"text"} JSX expressions with literal strings
    for (const m of line.matchAll(/\{"([^"]+)"\}/g)) {
      const text = m[1].trim()
      if (isCandidate(text)) {
        results.push({ text, line: i + 1 })
      }
    }
  }

  return results
}

/** Decide whether a string is a candidate for externalization. */
function isCandidate(text: string): boolean {
  // Must be longer than 3 characters
  if (text.length <= 3) return false

  // Must contain at least one letter (actual words, not just symbols/numbers)
  if (!/[a-zA-Z]/.test(text)) return false

  // Ignore template expressions
  if (text.includes("{") || text.includes("}")) return false

  // Ignore things that look like code / identifiers
  if (/^[a-z][a-zA-Z0-9]*$/.test(text)) return false

  return true
}

// ── main ─────────────────────────────────────────────────────────────────────

interface Warning {
  file: string
  line: number
  text: string
  reason: string
}

const warnings: Warning[] = []

for (const dir of SCAN_DIRS) {
  for (const file of collectTsx(dir)) {
    const source = fs.readFileSync(file, "utf-8")
    const labelValues = extractDefaultLabels(source)
    const candidates = extractJsxTextCandidates(source)
    const rel = path.relative(ROOT, file).replace(/\\/g, "/")

    for (const { text, line } of candidates) {
      if (labelValues) {
        // Component has defaultLabels — check if JSX text is covered
        const covered = labelValues.some(
          (v) => text === v || text.includes(v)
        )
        if (!covered) {
          warnings.push({
            file: rel,
            line,
            text,
            reason: "JSX text not found in defaultLabels",
          })
        }
      } else {
        // No defaultLabels — flag as potential candidate
        warnings.push({
          file: rel,
          line,
          text,
          reason: "No defaultLabels defined — potential hardcoded string",
        })
      }
    }
  }
}

// ── output ───────────────────────────────────────────────────────────────────

if (warnings.length === 0) {
  console.log("✓ No hardcoded string warnings found.")
} else {
  console.log(`⚠ Found ${warnings.length} warning(s):\n`)
  for (const w of warnings) {
    console.log(`  ${w.file}:${w.line}`)
    console.log(`    Text: "${w.text}"`)
    console.log(`    ${w.reason}\n`)
  }
}

process.exit(0)
