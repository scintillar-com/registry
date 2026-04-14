import { withCompilerOptions } from "react-docgen-typescript"
import ts from "typescript"
import fs from "fs"
import path from "path"
import crypto from "crypto"

const UI_DIR = path.join(process.cwd(), "components", "ui")
const BLOCKS_DIR = path.join(process.cwd(), "registry", "new-york", "blocks")
const OUTPUT_DIR = path.join(process.cwd(), "public", "props")
const HASH_FILE = path.join(OUTPUT_DIR, ".hashes.json")

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
        return !!prop.declarations.find((d) => !d.fileName.includes("node_modules"))
      }
      return true
    },
  }
)

fs.mkdirSync(OUTPUT_DIR, { recursive: true })

// Load previous hashes
let prevHashes: Record<string, string> = {}
if (fs.existsSync(HASH_FILE)) {
  try { prevHashes = JSON.parse(fs.readFileSync(HASH_FILE, "utf-8")) } catch {}
}
const newHashes: Record<string, string> = {}

function hashFile(filePath: string): string {
  return crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex")
}

// Scan UI components
const uiFiles = fs.existsSync(UI_DIR)
  ? fs.readdirSync(UI_DIR).filter((f) => f.endsWith(".tsx")).map((f) => ({
      name: f.replace(/\.tsx$/, ""),
      path: path.join(UI_DIR, f),
    }))
  : []

// Scan blocks
const blockFiles = fs.existsSync(BLOCKS_DIR)
  ? fs.readdirSync(BLOCKS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .filter((d) => d.name !== "hello-world" && d.name !== "example-form")
      .map((d) => ({ name: d.name, path: path.join(BLOCKS_DIR, d.name, `${d.name}.tsx`) }))
      .filter((f) => fs.existsSync(f.path))
  : []

const allFiles = [...uiFiles, ...blockFiles]

let generated = 0
let skipped = 0

for (const file of allFiles) {
  const hash = hashFile(file.path)
  newHashes[file.name] = hash

  if (prevHashes[file.name] === hash && fs.existsSync(path.join(OUTPUT_DIR, `${file.name}.json`))) {
    skipped++
    continue
  }

  try {
    const docs = parser.parse(file.path)
    if (docs.length === 0) continue

    const output = docs.map((doc) => ({
      displayName: doc.displayName,
      description: doc.description,
      props: Object.entries(doc.props).map(([name, prop]) => ({
        name,
        type: prop.type.name,
        required: prop.required,
        defaultValue: prop.defaultValue?.value ?? null,
        description: prop.description,
      })),
    }))

    fs.writeFileSync(path.join(OUTPUT_DIR, `${file.name}.json`), JSON.stringify(output, null, 2))
    generated++
    console.log(`  [props] ✓ ${file.name} (${output.length} component${output.length > 1 ? "s" : ""})`)
  } catch (err) {
    console.log(`  [props] ✕ ${file.name}: ${(err as Error).message}`)
  }
}

fs.writeFileSync(HASH_FILE, JSON.stringify(newHashes, null, 2))
console.log(`\n[props] Generated ${generated}, skipped ${skipped} unchanged (${allFiles.length} total)`)
