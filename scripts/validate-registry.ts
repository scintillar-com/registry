import fs from "fs"
import path from "path"

const ROOT = process.cwd()
const REGISTRY_PATH = path.join(ROOT, "registry.json")
const PUBLIC_R = path.join(ROOT, "public", "r")

let errors = 0

function error(msg: string) {
  console.error(`  ✕ ${msg}`)
  errors++
}

function ok(msg: string) {
  console.log(`  ✓ ${msg}`)
}

// 1. Parse registry.json
console.log("\n📋 Validating registry.json")
const raw = fs.readFileSync(REGISTRY_PATH, "utf-8")
const registry = JSON.parse(raw)

if (!registry.items || !Array.isArray(registry.items)) {
  error("registry.json missing 'items' array")
  process.exit(1)
}

ok(`${registry.items.length} items found`)

// 2. Validate each item has required fields and files exist
console.log("\n📁 Checking file paths")
for (const item of registry.items) {
  if (!item.name) { error("Item missing 'name'"); continue }
  if (!item.type) { error(`${item.name}: missing 'type'`); continue }
  if (!item.files || item.files.length === 0) {
    error(`${item.name}: missing 'files'`)
    continue
  }

  for (const file of item.files) {
    const filePath = path.join(ROOT, file.path)
    if (!fs.existsSync(filePath)) {
      error(`${item.name}: file not found: ${file.path}`)
    }
  }
}

const itemsWithFiles = registry.items.filter(
  (i: any) => i.files?.every((f: any) => fs.existsSync(path.join(ROOT, f.path)))
)
ok(`${itemsWithFiles.length}/${registry.items.length} items have valid file paths`)

// 3. Check built output exists
console.log("\n🏗️  Checking built output (public/r/)")
if (!fs.existsSync(PUBLIC_R)) {
  error("public/r/ directory not found — run 'pnpm registry:build' first")
} else {
  const builtFiles = fs.readdirSync(PUBLIC_R).filter((f) => f.endsWith(".json"))
  ok(`${builtFiles.length} built JSON files found`)

  // Check each registry item has a corresponding built file
  let missing = 0
  for (const item of registry.items) {
    const jsonPath = path.join(PUBLIC_R, `${item.name}.json`)
    if (!fs.existsSync(jsonPath)) {
      error(`${item.name}: no built output at public/r/${item.name}.json`)
      missing++
    }
  }
  if (missing === 0) ok("All registry items have built output")

  // Validate built JSON schema (what the shadcn CLI expects)
  console.log("\n📐 Validating built JSON schema (CLI compatibility)")
  let schemaErrors = 0
  for (const file of builtFiles) {
    if (file === "registry.json") continue
    const name = file.replace(/\.json$/, "")
    const filePath = path.join(PUBLIC_R, file)
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))

      // Required top-level fields
      if (!data.name) { error(`${name}: missing 'name' field`); schemaErrors++ }
      if (!data.type) { error(`${name}: missing 'type' field`); schemaErrors++ }
      if (!data.files || !Array.isArray(data.files) || data.files.length === 0) {
        error(`${name}: missing or empty 'files' array`)
        schemaErrors++
        continue
      }

      // Validate each file entry
      for (let i = 0; i < data.files.length; i++) {
        const f = data.files[i]
        if (!f.path) { error(`${name}: files[${i}] missing 'path'`); schemaErrors++ }
        if (!f.content || typeof f.content !== "string") {
          error(`${name}: files[${i}] missing or empty 'content' — CLI will install a blank file`)
          schemaErrors++
        }
        if (!f.type) { error(`${name}: files[${i}] missing 'type'`); schemaErrors++ }

        // Validate content is non-trivial (not just whitespace)
        if (f.content && f.content.trim().length < 10) {
          error(`${name}: files[${i}] content is suspiciously short (${f.content.trim().length} chars)`)
          schemaErrors++
        }
      }

      // Validate type is a known registry type
      const validTypes = [
        "registry:component", "registry:block", "registry:hook",
        "registry:lib", "registry:page", "registry:style", "registry:theme",
      ]
      if (!validTypes.includes(data.type)) {
        error(`${name}: unknown type '${data.type}'`)
        schemaErrors++
      }

      // Validate dependencies reference real npm packages (basic check — no @ in name unless scoped)
      if (data.dependencies && Array.isArray(data.dependencies)) {
        for (const dep of data.dependencies) {
          if (typeof dep !== "string" || dep.length === 0) {
            error(`${name}: invalid dependency entry`)
            schemaErrors++
          }
        }
      }

      // Validate registryDependencies are strings
      if (data.registryDependencies && Array.isArray(data.registryDependencies)) {
        for (const dep of data.registryDependencies) {
          if (typeof dep !== "string") {
            error(`${name}: invalid registryDependency entry`)
            schemaErrors++
          }
        }
      }
    } catch (e) {
      error(`${name}: invalid JSON — ${(e as Error).message}`)
      schemaErrors++
    }
  }
  if (schemaErrors === 0) ok(`All ${builtFiles.length - 1} built items pass schema validation`)
}

// 4. Validate dependency resolution
console.log("\n🔗 Checking dependency resolution")
const itemNames = new Set(registry.items.map((i: any) => i.name))
let depErrors = 0
for (const item of registry.items) {
  if (!item.registryDependencies) continue
  for (const dep of item.registryDependencies) {
    if (!itemNames.has(dep)) {
      error(`${item.name}: registry dependency '${dep}' not found in registry`)
      depErrors++
    }
  }
}
if (depErrors === 0) ok("All registry dependencies resolve")

// 5. Check for orphaned components (in components/ui but not in registry)
console.log("\n🔍 Checking for orphaned components")
const uiDir = path.join(ROOT, "components", "ui")
if (fs.existsSync(uiDir)) {
  const uiFiles = fs.readdirSync(uiDir).filter((f) => f.endsWith(".tsx"))
  const registeredNames = new Set(registry.items.map((i: any) => i.name))
  let orphaned = 0
  for (const file of uiFiles) {
    const name = file.replace(/\.tsx$/, "")
    if (!registeredNames.has(name)) {
      error(`components/ui/${file} is not registered in registry.json`)
      orphaned++
    }
  }
  if (orphaned === 0) ok(`All ${uiFiles.length} UI components are registered`)
}

// 6. Check size-limit coverage
console.log("\n📏 Checking size-limit coverage")
const sizeLimitPath = path.join(ROOT, ".size-limit.json")
if (fs.existsSync(sizeLimitPath)) {
  const sizeLimitEntries: { path: string }[] = JSON.parse(fs.readFileSync(sizeLimitPath, "utf-8"))
  const trackedPaths = new Set(sizeLimitEntries.map((e) => e.path.replace(/\\/g, "/")))

  // Check UI components
  const uiComponents = fs.readdirSync(path.join(ROOT, "components", "ui")).filter((f) => f.endsWith(".tsx"))
  let missingSize = 0
  for (const file of uiComponents) {
    const rel = `components/ui/${file}`
    if (!trackedPaths.has(rel)) {
      error(`${rel} is not tracked in .size-limit.json`)
      missingSize++
    }
  }

  // Check blocks
  const blocksDir = path.join(ROOT, "registry", "new-york", "blocks")
  const skipBlocks = ["hello-world", "example-form"]
  if (fs.existsSync(blocksDir)) {
    for (const dir of fs.readdirSync(blocksDir)) {
      if (skipBlocks.includes(dir)) continue
      const mainFile = path.join(blocksDir, dir, `${dir}.tsx`)
      if (fs.existsSync(mainFile)) {
        const rel = `registry/new-york/blocks/${dir}/${dir}.tsx`
        if (!trackedPaths.has(rel)) {
          error(`${rel} is not tracked in .size-limit.json`)
          missingSize++
        }
      }
    }
  }

  if (missingSize === 0) ok(`All components and blocks are tracked in .size-limit.json (${trackedPaths.size} entries)`)
} else {
  error(".size-limit.json not found")
}

// Summary
console.log()
if (errors === 0) {
  console.log("✅ Registry validation passed")
} else {
  console.log(`❌ Registry validation failed with ${errors} error(s)`)
  process.exit(1)
}
