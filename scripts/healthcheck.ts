import fs from "fs"
import path from "path"

const PROPS_DIR = path.join(process.cwd(), "public", "props")
const A11Y_DIR_CONTENT = path.join(process.cwd(), "content", "a11y")
const UI_DIR = path.join(process.cwd(), "components", "ui")
const BLOCKS_DIR = path.join(
  process.cwd(),
  "registry",
  "new-york",
  "blocks"
)
const TESTS_DIR = path.join(process.cwd(), "tests")
const PREVIEWS_DIR = path.join(process.cwd(), "components", "previews")

// Known CVA variant prop names that react-docgen-typescript can't trace
const CVA_PROP_NAMES = new Set([
  "variant",
  "size",
  "inset",
  "side",
  "collapsible",
])

// ── Gather all component names ──────────────────────────────────

function getAllComponentNames(): string[] {
  const names: string[] = []
  if (fs.existsSync(UI_DIR)) {
    for (const f of fs.readdirSync(UI_DIR).filter((f) => f.endsWith(".tsx")))
      names.push(f.replace(/\.tsx$/, ""))
  }
  if (fs.existsSync(BLOCKS_DIR)) {
    for (const d of fs.readdirSync(BLOCKS_DIR, { withFileTypes: true })) {
      if (d.isDirectory() && d.name !== "hello-world" && d.name !== "example-form")
        names.push(d.name)
    }
  }
  return names.sort()
}

// ── Props documentation health ──────────────────────────────────

interface PropInfo {
  component: string
  displayName: string
  prop: string
  documented: boolean
  isCva: boolean
}

function getPropsHealth(): PropInfo[] {
  const results: PropInfo[] = []
  if (!fs.existsSync(PROPS_DIR)) return results

  // Skip hidden manifests like `.hashes.json` that the generators write
  // alongside the per-component props files for incremental builds.
  for (const file of fs
    .readdirSync(PROPS_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("."))) {
    const component = file.replace(/\.json$/, "")
    const data = JSON.parse(fs.readFileSync(path.join(PROPS_DIR, file), "utf8"))
    for (const comp of data) {
      for (const prop of comp.props) {
        results.push({
          component,
          displayName: comp.displayName,
          prop: prop.name,
          documented: !!prop.description,
          isCva: CVA_PROP_NAMES.has(prop.name),
        })
      }
    }
  }
  return results
}

// ── Test coverage health ────────────────────────────────────────

function getTestCoverage(componentNames: string[]): { name: string; hasTest: boolean }[] {
  const testFiles = new Set<string>()
  if (fs.existsSync(TESTS_DIR)) {
    const scan = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) scan(path.join(dir, entry.name))
        else if (entry.name.match(/\.(test|spec)\.(ts|tsx)$/))
          testFiles.add(entry.name.replace(/\.(test|spec)\.(ts|tsx)$/, ""))
      }
    }
    scan(TESTS_DIR)
  }

  return componentNames.map((name) => ({
    name,
    hasTest: testFiles.has(name),
  }))
}

// ── Preview coverage ────────────────────────────────────────────

function getPreviewCoverage(componentNames: string[]): { name: string; hasPreview: boolean }[] {
  const previewFiles = new Set<string>()
  if (fs.existsSync(PREVIEWS_DIR)) {
    for (const f of fs.readdirSync(PREVIEWS_DIR)) {
      previewFiles.add(f.replace(/-preview\.tsx$/, ""))
    }
  }
  return componentNames.map((name) => ({
    name,
    hasPreview: previewFiles.has(name),
  }))
}

// ── A11y documentation health ───────────────────────────────────

function getA11yCoverage(componentNames: string[]): { name: string; hasA11y: boolean }[] {
  const a11yFiles = new Set<string>()
  if (fs.existsSync(A11Y_DIR_CONTENT)) {
    for (const f of fs.readdirSync(A11Y_DIR_CONTENT).filter((f) => f.endsWith(".yaml"))) {
      a11yFiles.add(f.replace(/\.yaml$/, ""))
    }
  }
  return componentNames.map((name) => ({
    name,
    hasA11y: a11yFiles.has(name),
  }))
}

// ── Output ──────────────────────────────────────────────────────

const componentNames = getAllComponentNames()
const propsHealth = getPropsHealth()
const testCoverage = getTestCoverage(componentNames)
const previewCoverage = getPreviewCoverage(componentNames)
const a11yCoverage = getA11yCoverage(componentNames)

const totalProps = propsHealth.length
const documentedProps = propsHealth.filter((p) => p.documented).length
const cvaProps = propsHealth.filter((p) => p.isCva)
const cvaDocumented = cvaProps.filter((p) => p.documented).length
const nonCvaProps = propsHealth.filter((p) => !p.isCva)
const nonCvaDocumented = nonCvaProps.filter((p) => p.documented).length

const testedCount = testCoverage.filter((t) => t.hasTest).length
const previewCount = previewCoverage.filter((p) => p.hasPreview).length
const a11yCount = a11yCoverage.filter((a) => a.hasA11y).length

console.log("╔══════════════════════════════════════════════╗")
console.log("║         UI Registry Health Check             ║")
console.log("╚══════════════════════════════════════════════╝")
console.log()

// Props documentation
console.log("📋 PROPS DOCUMENTATION")
console.log(`   Total props:       ${totalProps}`)
console.log(`   Documented:        ${documentedProps}/${totalProps} (${pct(documentedProps, totalProps)})`)
console.log(`   ├─ Non-CVA props:  ${nonCvaDocumented}/${nonCvaProps.length} (${pct(nonCvaDocumented, nonCvaProps.length)})`)
console.log(`   └─ CVA props:      ${cvaDocumented}/${cvaProps.length} (${pct(cvaDocumented, cvaProps.length)})`)
console.log()

if (cvaProps.filter((p) => !p.documented).length > 0) {
  console.log("   CVA props not extracted (parser limitation):")
  const grouped = new Map<string, string[]>()
  for (const p of cvaProps.filter((p) => !p.documented)) {
    const key = `${p.component}/${p.displayName}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(p.prop)
  }
  for (const [key, props] of grouped) {
    console.log(`     ${key}: ${props.join(", ")}`)
  }
  console.log()
}

const undocNonCva = nonCvaProps.filter((p) => !p.documented)
if (undocNonCva.length > 0) {
  console.log("   Non-CVA props missing docs:")
  const grouped = new Map<string, string[]>()
  for (const p of undocNonCva) {
    const key = `${p.component}/${p.displayName}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(p.prop)
  }
  for (const [key, props] of grouped) {
    console.log(`     ${key}: ${props.join(", ")}`)
  }
  console.log()
}

// Test coverage
console.log("🧪 TEST COVERAGE")
console.log(`   Components with tests: ${testedCount}/${componentNames.length} (${pct(testedCount, componentNames.length)})`)
const untested = testCoverage.filter((t) => !t.hasTest)
if (untested.length > 0) {
  console.log(`   Missing tests: ${untested.map((t) => t.name).join(", ")}`)
}
console.log()

// A11y coverage
console.log("♿ ACCESSIBILITY DOCS")
console.log(`   Components with a11y docs: ${a11yCount}/${componentNames.length} (${pct(a11yCount, componentNames.length)})`)
const noA11y = a11yCoverage.filter((a) => !a.hasA11y)
if (noA11y.length > 0) {
  console.log(`   Missing a11y docs: ${noA11y.map((a) => a.name).join(", ")}`)
}
console.log()

// Preview coverage
console.log("👁  PREVIEW COVERAGE")
console.log(`   Components with previews: ${previewCount}/${componentNames.length} (${pct(previewCount, componentNames.length)})`)
const noPreviews = previewCoverage.filter((p) => !p.hasPreview)
if (noPreviews.length > 0) {
  console.log(`   Missing previews: ${noPreviews.map((p) => p.name).join(", ")}`)
}
console.log()

// Summary bar
const docScore = Math.round((documentedProps / totalProps) * 100)
const testScore = Math.round((testedCount / componentNames.length) * 100)
const previewScore = Math.round((previewCount / componentNames.length) * 100)
const a11yScore = Math.round((a11yCount / componentNames.length) * 100)
const overall = Math.round((docScore + testScore + previewScore + a11yScore) / 4)

console.log("📊 OVERALL HEALTH")
console.log(`   Docs:     ${bar(docScore)} ${docScore}%`)
console.log(`   Tests:    ${bar(testScore)} ${testScore}%`)
console.log(`   Previews: ${bar(previewScore)} ${previewScore}%`)
console.log(`   A11y:     ${bar(a11yScore)} ${a11yScore}%`)
console.log(`   Overall:  ${bar(overall)} ${overall}%`)
console.log()

function pct(n: number, total: number): string {
  return total === 0 ? "N/A" : `${Math.round((n / total) * 100)}%`
}

function bar(pct: number): string {
  const filled = Math.round(pct / 5)
  return "█".repeat(filled) + "░".repeat(20 - filled)
}
