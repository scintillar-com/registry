import fs from "fs"
import path from "path"
import crypto from "crypto"

const ROOT = process.cwd()
const TESTS_DIR = path.join(ROOT, "tests")
const PROPS_DIR = path.join(ROOT, "public", "props")
const A11Y_DIR = path.join(ROOT, "content", "a11y")
const PREVIEWS_DIR = path.join(ROOT, "components", "previews")
const OUTPUT_DIR = path.join(ROOT, "public", "tests")
const HASH_FILE = path.join(OUTPUT_DIR, ".hashes.json")

fs.mkdirSync(OUTPUT_DIR, { recursive: true })

// Load previous hashes
let prevHashes: Record<string, string> = {}
if (fs.existsSync(HASH_FILE)) {
  try { prevHashes = JSON.parse(fs.readFileSync(HASH_FILE, "utf-8")) } catch {}
}
const newHashes: Record<string, string> = {}

interface TestInfo {
  file: string
  type: string
  tests: string[]
}

interface ComponentTestReport {
  component: string
  hasUnitTests: boolean
  hasInteractionTests: boolean
  hasVisualTests: boolean
  hasA11yTests: boolean
  hasPerformanceTests: boolean
  hasProps: boolean
  hasA11yDocs: boolean
  hasPreview: boolean
  testFiles: TestInfo[]
  totalTests: number
}

/** Hash the contents of multiple files into a single digest */
function hashFiles(paths: string[]): string {
  const h = crypto.createHash("md5")
  for (const p of paths.sort()) {
    if (fs.existsSync(p)) {
      h.update(p)
      h.update(fs.readFileSync(p))
    }
  }
  return h.digest("hex")
}

/** Collect all input file paths that affect a component's test report */
function getInputPaths(name: string): string[] {
  const paths: string[] = []

  // Unit test files
  const unitPaths = [
    path.join(TESTS_DIR, "unit", "components", `${name}.test.tsx`),
    path.join(TESTS_DIR, "unit", "components", `${name}.test.ts`),
    path.join(TESTS_DIR, "unit", "blocks", `${name}.test.tsx`),
    path.join(TESTS_DIR, "unit", "blocks", `${name}.test.ts`),
    path.join(TESTS_DIR, "unit", "lib", `${name}.test.ts`),
  ]
  for (const p of unitPaths) {
    if (fs.existsSync(p)) paths.push(p)
  }

  // Interaction test
  const interactionPath = path.join(TESTS_DIR, "e2e", "interaction", `${name}.spec.ts`)
  if (fs.existsSync(interactionPath)) paths.push(interactionPath)

  // Shared e2e specs (visual, a11y, performance) — changes to these affect all components
  const sharedSpecs = [
    path.join(TESTS_DIR, "e2e", "visual", "components.spec.ts"),
    path.join(TESTS_DIR, "e2e", "a11y", "components.spec.ts"),
    path.join(TESTS_DIR, "e2e", "performance", "mount-time.spec.ts"),
  ]
  for (const p of sharedSpecs) {
    if (fs.existsSync(p)) paths.push(p)
  }

  // Health check inputs
  if (fs.existsSync(path.join(PROPS_DIR, `${name}.json`))) paths.push(path.join(PROPS_DIR, `${name}.json`))
  if (fs.existsSync(path.join(A11Y_DIR, `${name}.yaml`))) paths.push(path.join(A11Y_DIR, `${name}.yaml`))
  if (fs.existsSync(path.join(PREVIEWS_DIR, `${name}-preview.tsx`))) paths.push(path.join(PREVIEWS_DIR, `${name}-preview.tsx`))

  return paths
}

function extractTestNames(filePath: string): string[] {
  const content = fs.readFileSync(filePath, "utf-8")
  const tests: string[] = []
  const regex = /(?:it|test)\s*\(\s*["'`]([^"'`]+)["'`]/g
  let match
  while ((match = regex.exec(content)) !== null) {
    tests.push(match[1])
  }
  return tests
}

function findTestFiles(componentName: string): TestInfo[] {
  const results: TestInfo[] = []

  const unitPaths = [
    path.join(TESTS_DIR, "unit", "components", `${componentName}.test.tsx`),
    path.join(TESTS_DIR, "unit", "components", `${componentName}.test.ts`),
    path.join(TESTS_DIR, "unit", "blocks", `${componentName}.test.tsx`),
    path.join(TESTS_DIR, "unit", "blocks", `${componentName}.test.ts`),
    path.join(TESTS_DIR, "unit", "lib", `${componentName}.test.ts`),
  ]
  for (const p of unitPaths) {
    if (fs.existsSync(p)) {
      results.push({
        file: path.relative(ROOT, p).replace(/\\/g, "/"),
        type: "unit",
        tests: extractTestNames(p),
      })
    }
  }

  const interactionPath = path.join(TESTS_DIR, "e2e", "interaction", `${componentName}.spec.ts`)
  if (fs.existsSync(interactionPath)) {
    results.push({
      file: path.relative(ROOT, interactionPath).replace(/\\/g, "/"),
      type: "interaction",
      tests: extractTestNames(interactionPath),
    })
  }

  const visualPath = path.join(TESTS_DIR, "e2e", "visual", "components.spec.ts")
  if (fs.existsSync(visualPath)) {
    const content = fs.readFileSync(visualPath, "utf-8")
    if (content.includes(`"${componentName}"`)) {
      results.push({
        file: "tests/e2e/visual/components.spec.ts",
        type: "visual",
        tests: [`${componentName} matches snapshot`],
      })
    }
  }

  const a11yTestPath = path.join(TESTS_DIR, "e2e", "a11y", "components.spec.ts")
  if (fs.existsSync(a11yTestPath)) {
    const content = fs.readFileSync(a11yTestPath, "utf-8")
    if (content.includes(`"${componentName}"`)) {
      results.push({
        file: "tests/e2e/a11y/components.spec.ts",
        type: "a11y",
        tests: [`${componentName} has no a11y violations`],
      })
    }
  }

  const perfPath = path.join(TESTS_DIR, "e2e", "performance", "mount-time.spec.ts")
  if (fs.existsSync(perfPath)) {
    const content = fs.readFileSync(perfPath, "utf-8")
    if (content.includes(`"${componentName}"`)) {
      results.push({
        file: "tests/e2e/performance/mount-time.spec.ts",
        type: "performance",
        tests: [`${componentName} mounts under threshold`],
      })
    }
  }

  return results
}

// Get all component names from registry
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "registry.json"), "utf-8"))
const componentNames: string[] = registry.items
  .map((i: any) => i.name)
  .filter((n: string) => n !== "hello-world" && n !== "example-form")

let generated = 0
let skipped = 0

for (const name of componentNames) {
  const inputPaths = getInputPaths(name)
  const hash = hashFiles(inputPaths)
  newHashes[name] = hash

  // Skip if unchanged
  if (prevHashes[name] === hash && fs.existsSync(path.join(OUTPUT_DIR, `${name}.json`))) {
    skipped++
    continue
  }

  const testFiles = findTestFiles(name)
  const totalTests = testFiles.reduce((sum, f) => sum + f.tests.length, 0)

  const report: ComponentTestReport = {
    component: name,
    hasUnitTests: testFiles.some((f) => f.type === "unit"),
    hasInteractionTests: testFiles.some((f) => f.type === "interaction"),
    hasVisualTests: testFiles.some((f) => f.type === "visual"),
    hasA11yTests: testFiles.some((f) => f.type === "a11y"),
    hasPerformanceTests: testFiles.some((f) => f.type === "performance"),
    hasProps: fs.existsSync(path.join(PROPS_DIR, `${name}.json`)),
    hasA11yDocs: fs.existsSync(path.join(A11Y_DIR, `${name}.yaml`)),
    hasPreview: fs.existsSync(path.join(PREVIEWS_DIR, `${name}-preview.tsx`)),
    testFiles,
    totalTests,
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${name}.json`),
    JSON.stringify(report, null, 2)
  )
  generated++
  if (totalTests > 0) {
    console.log(`  [tests] ✓ ${name} (${totalTests} tests)`)
  }
}

// Save hashes for next run
fs.writeFileSync(HASH_FILE, JSON.stringify(newHashes, null, 2))

console.log(`\n[tests] Generated ${generated}, skipped ${skipped} unchanged (${componentNames.length} total)`)
