import { withCompilerOptions } from "react-docgen-typescript"
import ts from "typescript"
import fs from "fs"
import path from "path"

const UI_DIR = path.join(process.cwd(), "components", "ui")
const BLOCKS_DIR = path.join(
  process.cwd(),
  "registry",
  "new-york",
  "blocks"
)
const SNAPSHOT_DIR = path.join(process.cwd(), "tests", "snapshots", "api")

const isCheckMode = process.argv.includes("--check")

const parser = withCompilerOptions(
  {
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2017,
    paths: { "@/*": ["./*"] },
    baseUrl: process.cwd(),
  },
  {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop) => {
      if (prop.declarations && prop.declarations.length > 0) {
        const hasPropAdditionalDescription = prop.declarations.find(
          (d) => !d.fileName.includes("node_modules")
        )
        return !!hasPropAdditionalDescription
      }
      return true
    },
  }
)

interface PropSnapshot {
  name: string
  type: string
  required: boolean
  defaultValue: string | null
}

interface ComponentSnapshot {
  displayName: string
  description: string
  props: PropSnapshot[]
}

function extractSnapshot(filePath: string): ComponentSnapshot[] | null {
  try {
    const docs = parser.parse(filePath)
    if (docs.length === 0) return null

    return docs.map((doc) => ({
      displayName: doc.displayName,
      description: doc.description,
      props: Object.entries(doc.props)
        .map(([name, prop]) => ({
          name,
          type: prop.type.name,
          required: prop.required,
          defaultValue: prop.defaultValue?.value ?? null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
  } catch {
    return null
  }
}

function serializeSnapshot(snapshot: ComponentSnapshot[]): string {
  return JSON.stringify(snapshot, null, 2)
}

// Collect all component files
const uiFiles = fs.existsSync(UI_DIR)
  ? fs
      .readdirSync(UI_DIR)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => ({
        name: f.replace(/\.tsx$/, ""),
        path: path.join(UI_DIR, f),
      }))
  : []

const blockFiles = fs.existsSync(BLOCKS_DIR)
  ? fs
      .readdirSync(BLOCKS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .filter((d) => d.name !== "hello-world" && d.name !== "example-form")
      .map((d) => ({
        name: d.name,
        path: path.join(BLOCKS_DIR, d.name, `${d.name}.tsx`),
      }))
      .filter((f) => fs.existsSync(f.path))
  : []

const allFiles = [...uiFiles, ...blockFiles]

if (!isCheckMode) {
  // Generate mode: extract and save snapshots
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true })

  let total = 0
  for (const file of allFiles) {
    const snapshot = extractSnapshot(file.path)
    if (!snapshot) continue

    const outPath = path.join(SNAPSHOT_DIR, `${file.name}.api.json`)
    fs.writeFileSync(outPath, serializeSnapshot(snapshot))
    total++
    console.log(`  Generated: ${file.name}`)
  }

  console.log(`\nSaved ${total} API snapshots to tests/snapshots/api/`)
} else {
  // Check mode: compare current extraction against committed snapshots
  let breakingChanges = 0
  let warnings = 0
  let infos = 0
  const issues: string[] = []

  for (const file of allFiles) {
    const snapshotPath = path.join(SNAPSHOT_DIR, `${file.name}.api.json`)

    if (!fs.existsSync(snapshotPath)) {
      infos++
      issues.push(`[INFO]  ${file.name}: no committed snapshot found (new component?)`)
      continue
    }

    const currentSnapshot = extractSnapshot(file.path)
    if (!currentSnapshot) continue

    const committedSnapshot: ComponentSnapshot[] = JSON.parse(
      fs.readFileSync(snapshotPath, "utf-8")
    )

    // Compare each component in the file
    for (const current of currentSnapshot) {
      const committed = committedSnapshot.find(
        (c) => c.displayName === current.displayName
      )

      if (!committed) {
        infos++
        issues.push(
          `[INFO]  ${file.name}/${current.displayName}: new component export (non-breaking)`
        )
        continue
      }

      const currentProps = new Map(current.props.map((p) => [p.name, p]))
      const committedProps = new Map(committed.props.map((p) => [p.name, p]))

      // Check for removed props (breaking)
      for (const [propName] of committedProps) {
        if (!currentProps.has(propName)) {
          breakingChanges++
          issues.push(
            `[BREAK] ${file.name}/${current.displayName}: prop "${propName}" was removed`
          )
        }
      }

      // Check for new props (non-breaking)
      for (const [propName] of currentProps) {
        if (!committedProps.has(propName)) {
          infos++
          issues.push(
            `[INFO]  ${file.name}/${current.displayName}: prop "${propName}" was added`
          )
        }
      }

      // Check for changed props
      for (const [propName, currentProp] of currentProps) {
        const committedProp = committedProps.get(propName)
        if (!committedProp) continue

        if (currentProp.type !== committedProp.type) {
          warnings++
          issues.push(
            `[WARN]  ${file.name}/${current.displayName}: prop "${propName}" type changed from "${committedProp.type}" to "${currentProp.type}"`
          )
        }

        if (currentProp.required !== committedProp.required) {
          warnings++
          issues.push(
            `[WARN]  ${file.name}/${current.displayName}: prop "${propName}" required changed from ${committedProp.required} to ${currentProp.required}`
          )
        }
      }
    }

    // Check for removed component exports (breaking)
    for (const committed of committedSnapshot) {
      const stillExists = currentSnapshot.find(
        (c) => c.displayName === committed.displayName
      )
      if (!stillExists) {
        breakingChanges++
        issues.push(
          `[BREAK] ${file.name}/${committed.displayName}: component export was removed`
        )
      }
    }
  }

  // Print summary
  console.log("\n=== API Snapshot Check ===\n")

  if (issues.length === 0) {
    console.log("No API changes detected.\n")
  } else {
    for (const issue of issues) {
      console.log(issue)
    }
    console.log("")
  }

  console.log(`Breaking changes: ${breakingChanges}`)
  console.log(`Warnings:         ${warnings}`)
  console.log(`Info:             ${infos}`)

  if (breakingChanges > 0) {
    console.log(
      "\nBreaking changes detected! Update snapshots with: pnpm api:snapshot"
    )
    process.exit(1)
  }
}
