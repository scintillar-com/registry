import fs from "fs"
import path from "path"
import crypto from "crypto"
import YAML from "yaml"

const A11Y_DIR = path.join(process.cwd(), "content", "a11y")
const OUTPUT_DIR = path.join(process.cwd(), "public", "a11y")
const HASH_FILE = path.join(OUTPUT_DIR, ".hashes.json")

fs.mkdirSync(OUTPUT_DIR, { recursive: true })

if (!fs.existsSync(A11Y_DIR)) {
  console.log("[a11y] No a11y content directory found")
  process.exit(0)
}

// Load previous hashes
let prevHashes: Record<string, string> = {}
if (fs.existsSync(HASH_FILE)) {
  try { prevHashes = JSON.parse(fs.readFileSync(HASH_FILE, "utf-8")) } catch {}
}
const newHashes: Record<string, string> = {}

function hashFile(filePath: string): string {
  return crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex")
}

const files = fs.readdirSync(A11Y_DIR).filter((f) => f.endsWith(".yaml"))
let generated = 0
let skipped = 0

for (const file of files) {
  const name = file.replace(/\.yaml$/, "")
  const srcPath = path.join(A11Y_DIR, file)
  const outPath = path.join(OUTPUT_DIR, `${name}.json`)
  const hash = hashFile(srcPath)
  newHashes[name] = hash

  if (prevHashes[name] === hash && fs.existsSync(outPath)) {
    skipped++
    continue
  }

  try {
    const raw = fs.readFileSync(srcPath, "utf-8")
    const data = YAML.parse(raw)
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2))
    generated++
    console.log(`  [a11y]  ✓ ${name}`)
  } catch (err) {
    console.log(`  [a11y]  ✕ ${file}: ${(err as Error).message}`)
  }
}

fs.writeFileSync(HASH_FILE, JSON.stringify(newHashes, null, 2))
console.log(`\n[a11y]  Generated ${generated}, skipped ${skipped} unchanged (${files.length} total)`)
