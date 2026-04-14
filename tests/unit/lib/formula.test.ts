import { describe, it, expect } from "vitest"
import { evaluateFormula } from "@/lib/formula"

describe("evaluateFormula", () => {
  // ---------------------------------------------------------------------------
  // Arithmetic
  // ---------------------------------------------------------------------------
  describe("arithmetic", () => {
    it("add: sums two numbers", () => {
      expect(evaluateFormula("=add(2, 3)", {})).toBe(5)
    })

    it("sub: subtracts two numbers", () => {
      expect(evaluateFormula("=sub(10, 4)", {})).toBe(6)
    })

    it("mul: multiplies two numbers", () => {
      expect(evaluateFormula("=mul(3, 7)", {})).toBe(21)
    })

    it("div: divides two numbers", () => {
      expect(evaluateFormula("=div(20, 4)", {})).toBe(5)
    })

    it("div: division by zero returns 0", () => {
      expect(evaluateFormula("=div(10, 0)", {})).toBe(0)
    })
  })

  // ---------------------------------------------------------------------------
  // Comparison
  // ---------------------------------------------------------------------------
  describe("comparison", () => {
    it("eq: returns true when equal", () => {
      expect(evaluateFormula("=eq(5, 5)", {})).toBe(true)
    })

    it("eq: returns false when not equal", () => {
      expect(evaluateFormula("=eq(5, 3)", {})).toBe(false)
    })

    it("neq: returns true when not equal", () => {
      expect(evaluateFormula("=neq(5, 3)", {})).toBe(true)
    })

    it("neq: returns false when equal", () => {
      expect(evaluateFormula("=neq(5, 5)", {})).toBe(false)
    })

    it("lt: returns true when a < b", () => {
      expect(evaluateFormula("=lt(2, 5)", {})).toBe(true)
    })

    it("lt: returns false when a >= b", () => {
      expect(evaluateFormula("=lt(5, 2)", {})).toBe(false)
    })

    it("gt: returns true when a > b", () => {
      expect(evaluateFormula("=gt(5, 2)", {})).toBe(true)
    })

    it("gt: returns false when a <= b", () => {
      expect(evaluateFormula("=gt(2, 5)", {})).toBe(false)
    })

    it("lte: returns true when a <= b", () => {
      expect(evaluateFormula("=lte(5, 5)", {})).toBe(true)
      expect(evaluateFormula("=lte(3, 5)", {})).toBe(true)
    })

    it("lte: returns false when a > b", () => {
      expect(evaluateFormula("=lte(6, 5)", {})).toBe(false)
    })

    it("gte: returns true when a >= b", () => {
      expect(evaluateFormula("=gte(5, 5)", {})).toBe(true)
      expect(evaluateFormula("=gte(7, 5)", {})).toBe(true)
    })

    it("gte: returns false when a < b", () => {
      expect(evaluateFormula("=gte(4, 5)", {})).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // String
  // ---------------------------------------------------------------------------
  describe("string", () => {
    it("concat: joins two strings", () => {
      expect(evaluateFormula('=concat("Hello", " World")', {})).toBe(
        "Hello World"
      )
    })

    it("concat: joins multiple values", () => {
      expect(evaluateFormula('=concat("a", "b", "c")', {})).toBe("abc")
    })
  })

  // ---------------------------------------------------------------------------
  // Date
  // ---------------------------------------------------------------------------
  describe("date", () => {
    it("year: extracts year from ISO date", () => {
      expect(evaluateFormula('=year("2024-06-15T10:30:00")', {})).toBe(2024)
    })

    it("month: extracts month (1-12)", () => {
      expect(evaluateFormula('=month("2024-06-15T10:30:00")', {})).toBe(6)
    })

    it("day: extracts day of month", () => {
      expect(evaluateFormula('=day("2024-06-15T10:30:00")', {})).toBe(15)
    })

    it("hour: extracts hour (0-23)", () => {
      expect(evaluateFormula('=hour("2024-06-15T10:30:00")', {})).toBe(10)
    })

    it("returns empty string for invalid date", () => {
      expect(evaluateFormula('=year("not-a-date")', {})).toBe("")
    })
  })

  // ---------------------------------------------------------------------------
  // Conditional
  // ---------------------------------------------------------------------------
  describe("conditional (if)", () => {
    it("returns then-branch when condition is truthy", () => {
      expect(evaluateFormula('=if(true, "yes", "no")', {})).toBe("yes")
    })

    it("returns else-branch when condition is falsy", () => {
      expect(evaluateFormula('=if(false, "yes", "no")', {})).toBe("no")
    })

    it("treats 0 as falsy", () => {
      expect(evaluateFormula('=if(0, "yes", "no")', {})).toBe("no")
    })

    it("treats non-zero number as truthy", () => {
      expect(evaluateFormula('=if(1, "yes", "no")', {})).toBe("yes")
    })
  })

  // ---------------------------------------------------------------------------
  // Field references
  // ---------------------------------------------------------------------------
  describe("field references", () => {
    it("resolves a field by name", () => {
      expect(evaluateFormula("=add({Price}, {Tax})", { Price: 100, Tax: 15 })).toBe(115)
    })

    it("resolves string fields in concat", () => {
      expect(
        evaluateFormula('=concat({First}, " ", {Last})', {
          First: "John",
          Last: "Doe",
        })
      ).toBe("John Doe")
    })

    it("missing field resolves to undefined", () => {
      // toNum(undefined) returns 0
      expect(evaluateFormula("=add({Missing}, 5)", {})).toBe(5)
    })
  })

  // ---------------------------------------------------------------------------
  // Nested calls
  // ---------------------------------------------------------------------------
  describe("nested calls", () => {
    it("evaluates nested if(gt(...))", () => {
      expect(
        evaluateFormula('=if(gt({Score}, 80), "Pass", "Fail")', { Score: 90 })
      ).toBe("Pass")
    })

    it("evaluates nested if(gt(...)) — else branch", () => {
      expect(
        evaluateFormula('=if(gt({Score}, 80), "Pass", "Fail")', { Score: 50 })
      ).toBe("Fail")
    })

    it("evaluates deeply nested arithmetic", () => {
      expect(evaluateFormula("=add(mul(2, 3), sub(10, 4))", {})).toBe(12)
    })
  })

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  describe("edge cases", () => {
    it("returns the string as-is if missing leading =", () => {
      expect(evaluateFormula("add(1, 2)", {})).toBe("add(1, 2)")
    })

    it("returns empty string as-is when formula is empty", () => {
      expect(evaluateFormula("", {})).toBe("")
    })

    it("returns #UNKNOWN for unknown function", () => {
      expect(evaluateFormula("=foobar(1, 2)", {})).toBe("#UNKNOWN(foobar)")
    })

    it("handles missing field gracefully (undefined → 0 in numeric context)", () => {
      expect(evaluateFormula("=mul({x}, 5)", {})).toBe(0)
    })
  })
})
