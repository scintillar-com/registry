import * as esbuild from "esbuild"
import fs from "fs"
import path from "path"
import os from "os"

const ROOT = process.cwd()

const COMPONENTS = [
  "button",
  "input",
  "password-input",
  "color-picker",
  "file-upload",
  "split-button",
]

// Size threshold multiplier: if the bundled output is more than this many times
// the source file size, flag it as potentially having unexpected side effects.
const SIZE_THRESHOLD = 10

async function getSourceSize(componentName: string): Promise<number> {
  const filePath = path.join(ROOT, "components", "ui", `${componentName}.tsx`)
  if (!fs.existsSync(filePath)) return 0
  const stat = fs.statSync(filePath)
  return stat.size
}

async function bundleSize(entryContent: string): Promise<number> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "side-effects-"))
  const entryFile = path.join(tmpDir, "entry.tsx")
  fs.writeFileSync(entryFile, entryContent)

  try {
    const result = await esbuild.build({
      entryPoints: [entryFile],
      bundle: true,
      treeShaking: true,
      write: false,
      format: "esm",
      jsx: "automatic",
      platform: "browser",
      alias: {
        "@": ROOT,
      },
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "next",
        "next/*",
        // The shell ships its helpers (e.g. `cn`) as `.ts` source via the
        // `./shell/*` subpath export. esbuild's exports-pattern resolver
        // doesn't try `resolveExtensions` on wildcard-mapped targets
        // (known behavior), so it can't find `./shell/lib/utils.ts`.
        // Next handles this fine via `transpilePackages` at the user's
        // real build time, so treating the shell as external here is
        // accurate for what this script measures (the component's own
        // dead-weight imports, not third-party footprint).
        "@sntlr/registry-shell",
        "@sntlr/registry-shell/*",
      ],
      logLevel: "silent",
    })

    let totalSize = 0
    for (const file of result.outputFiles) {
      totalSize += file.contents.length
    }
    return totalSize
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

async function main() {
  console.log("\n=== Side Effects Check ===\n")

  // Get baseline: an empty bundle
  const baselineSize = await bundleSize("// empty")

  let hasIssues = false

  for (const component of COMPONENTS) {
    const sourceFile = path.join(ROOT, "components", "ui", `${component}.tsx`)
    if (!fs.existsSync(sourceFile)) {
      console.log(`  SKIP  ${component} (file not found)`)
      continue
    }

    const sourceSize = await getSourceSize(component)

    const importContent = `export { default } from "@/components/ui/${component}";
export * from "@/components/ui/${component}";
`

    try {
      const componentSize = await bundleSize(importContent)
      const netSize = componentSize - baselineSize
      const ratio = sourceSize > 0 ? netSize / sourceSize : 0

      const sizeKB = (netSize / 1024).toFixed(1)
      const sourceKB = (sourceSize / 1024).toFixed(1)

      if (ratio > SIZE_THRESHOLD) {
        hasIssues = true
        console.log(
          `  WARN  ${component}: bundled ${sizeKB}KB from ${sourceKB}KB source (${ratio.toFixed(1)}x) — may pull in unexpected dependencies`
        )
      } else {
        console.log(
          `  OK    ${component}: bundled ${sizeKB}KB from ${sourceKB}KB source (${ratio.toFixed(1)}x)`
        )
      }
    } catch (err) {
      console.log(`  ERR   ${component}: ${(err as Error).message}`)
    }
  }

  console.log("")

  if (hasIssues) {
    console.log(
      "Some components may have unexpected side effects or heavy dependencies."
    )
    console.log(
      "Review the flagged components to ensure tree-shaking works correctly.\n"
    )
    process.exit(1)
  } else {
    console.log("All checked components look clean.\n")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
