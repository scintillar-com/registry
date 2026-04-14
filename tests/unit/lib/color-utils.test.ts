import { describe, it, expect } from "vitest"
import {
  hexToRgb,
  hexToHsl,
  hexToCmyk,
  formatColor,
} from "@/lib/color-utils"

describe("hexToRgb", () => {
  it("converts black #000000", () => {
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 })
  })

  it("converts white #ffffff", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 })
  })

  it("converts pure red #ff0000", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 })
  })

  it("converts pure green #00ff00", () => {
    expect(hexToRgb("#00ff00")).toEqual({ r: 0, g: 255, b: 0 })
  })

  it("converts pure blue #0000ff", () => {
    expect(hexToRgb("#0000ff")).toEqual({ r: 0, g: 0, b: 255 })
  })

  it("handles shorthand 3-char hex", () => {
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 })
  })
})

describe("hexToHsl", () => {
  it("converts black to h:0, s:0, l:0", () => {
    expect(hexToHsl("#000000")).toEqual({ h: 0, s: 0, l: 0 })
  })

  it("converts white to h:0, s:0, l:100", () => {
    expect(hexToHsl("#ffffff")).toEqual({ h: 0, s: 0, l: 100 })
  })

  it("converts pure red to h:0, s:100, l:50", () => {
    expect(hexToHsl("#ff0000")).toEqual({ h: 0, s: 100, l: 50 })
  })

  it("converts pure green to h:120, s:100, l:50", () => {
    expect(hexToHsl("#00ff00")).toEqual({ h: 120, s: 100, l: 50 })
  })

  it("converts pure blue to h:240, s:100, l:50", () => {
    expect(hexToHsl("#0000ff")).toEqual({ h: 240, s: 100, l: 50 })
  })
})

describe("hexToCmyk", () => {
  it("converts black to k:100", () => {
    expect(hexToCmyk("#000000")).toEqual({ c: 0, m: 0, y: 0, k: 100 })
  })

  it("converts white to all zeros", () => {
    expect(hexToCmyk("#ffffff")).toEqual({ c: 0, m: 0, y: 0, k: 0 })
  })

  it("converts pure red", () => {
    expect(hexToCmyk("#ff0000")).toEqual({ c: 0, m: 100, y: 100, k: 0 })
  })

  it("converts pure green", () => {
    expect(hexToCmyk("#00ff00")).toEqual({ c: 100, m: 0, y: 100, k: 0 })
  })

  it("converts pure blue", () => {
    expect(hexToCmyk("#0000ff")).toEqual({ c: 100, m: 100, y: 0, k: 0 })
  })
})

describe("formatColor", () => {
  const hex = "#ff8800"

  it("formats as uppercase HEX", () => {
    expect(formatColor(hex, "hex")).toBe("#FF8800")
  })

  it("formats as rgb()", () => {
    expect(formatColor(hex, "rgb")).toBe("rgb(255, 136, 0)")
  })

  it("formats as hsl()", () => {
    const result = formatColor(hex, "hsl")
    expect(result).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
  })

  it("formats as cmyk()", () => {
    const result = formatColor(hex, "cmyk")
    expect(result).toMatch(/^cmyk\(\d+%, \d+%, \d+%, \d+%\)$/)
  })
})

describe("round-trip: hex -> rgb -> verify", () => {
  it("converts #1a2b3c and verifies RGB components", () => {
    const { r, g, b } = hexToRgb("#1a2b3c")
    expect(r).toBe(0x1a)
    expect(g).toBe(0x2b)
    expect(b).toBe(0x3c)
  })

  it("converts #abcdef and verifies RGB components", () => {
    const { r, g, b } = hexToRgb("#abcdef")
    expect(r).toBe(0xab)
    expect(g).toBe(0xcd)
    expect(b).toBe(0xef)
  })
})
