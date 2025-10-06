import { expect, test } from "vitest"
import { CodePosition, tracePosition } from "./trace"

test("default depth", () => {
  const pos = tracePosition()

  expect(pos).toHaveProperty("url")
  expect(pos).toHaveProperty("line")
  expect(pos).toHaveProperty("column")
  expect(typeof pos.url).toBe("string")
  expect(typeof pos.line).toBe("number")
  expect(typeof pos.column).toBe("number")
  expect(pos.line).toBeGreaterThan(0)
  expect(pos.column).toBeGreaterThan(0)
})

test("depth 0", () => {
  const pos = tracePosition(0)

  expect(pos).toHaveProperty("url")
  expect(pos).toHaveProperty("line")
  expect(pos).toHaveProperty("column")
  expect(pos.line).toBeGreaterThan(0)
})

test("depth 1", () => {
  function caller() {
    return tracePosition(1)
  }

  const pos = caller()

  expect(pos).toHaveProperty("url")
  expect(pos).toHaveProperty("line")
  expect(pos).toHaveProperty("column")
})

test("out of bounds depth", () => {
  expect(() => tracePosition(100)).toThrow("stack depth(100) out of bounds")
})

test("stack trace formats", () => {
  const pos = tracePosition(0)

  expect(pos).toHaveProperty("url")
  expect(pos).toHaveProperty("line")
  expect(pos).toHaveProperty("column")
  expect(typeof pos.url).toBe("string")
  expect(typeof pos.line).toBe("number")
  expect(typeof pos.column).toBe("number")
})

test("CodePosition structure", () => {
  const pos: CodePosition = {
    url: "file:///test.ts",
    line: 42,
    column: 15,
  }

  expect(pos.url).toBe("file:///test.ts")
  expect(pos.line).toBe(42)
  expect(pos.column).toBe(15)
})
