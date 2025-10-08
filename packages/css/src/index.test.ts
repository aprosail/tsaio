import { css, cssVariable, type CssClass, type CssVariable } from "@/index"
import { expect, test } from "vitest"

test("cssVariable returns a CssVariable type", () => {
  const variable = cssVariable()

  expect(variable).toBeTypeOf("string")
  expect(variable).toMatch(/^--v-[a-f0-9]+$/)

  const testVariable: CssVariable = variable
  expect(testVariable).toBe(variable)
})

test("cssVariable returns unique values on multiple calls", () => {
  const variable1 = cssVariable()
  const variable2 = cssVariable()

  expect(variable1).not.toBe(variable2)
  expect(variable1).toMatch(/^--v-[a-f0-9]+$/)
  expect(variable2).toMatch(/^--v-[a-f0-9]+$/)
})

test("css function returns a CssClass type with template string", () => {
  const className = css`
    color: red;
  `

  expect(className).toBeTypeOf("string")
  expect(className).toMatch(/^cm[a-f0-9]{16}$/)

  const testClass: CssClass = className
  expect(testClass).toBe(className)
})

test("css function works with css variables", () => {
  const variable = cssVariable()
  const className = css`
    color: var(${variable});
    background: blue;
  `

  expect(className).toBeTypeOf("string")
  expect(className).toMatch(/^cm[a-f0-9]{16}$/)

  // 类型检查
  const testClass: CssClass = className
  expect(testClass).toBe(className)
})

test("css function returns same hash for same content", () => {
  const content1 = css`
    color: red;
    background: blue;
  `
  const content2 = css`
    color: red;
    background: blue;
  `

  expect(content1).toBe(content2)
})

test("css function returns different hash for different content", () => {
  const content1 = css`
    color: red;
  `
  const content2 = css`
    color: blue;
  `

  expect(content1).not.toBe(content2)
})

test("css function handles multiple css variables correctly", () => {
  const var1 = cssVariable()
  const var2 = cssVariable()
  const className = css`
    --primary: var(${var1});
    --secondary: var(${var2});
    color: var(--primary);
    background: var(--secondary);
  `

  expect(className).toBeTypeOf("string")
  expect(className).toMatch(/^cm[a-f0-9]{16}$/)
})

test("css function hash calculation is deterministic", () => {
  const content = "color: red; background: blue;"

  const template = Object.assign([content], { raw: [content] })
  const className1 = css(template as TemplateStringsArray)
  const className2 = css(template as TemplateStringsArray)

  expect(className1).toBe(className2)
  expect(className1).toMatch(/^cm[a-f0-9]{16}$/)
})

test("css function handles empty template correctly", () => {
  const className = css``

  expect(className).toBeTypeOf("string")
  expect(className).toMatch(/^cm[a-f0-9]{16}$/)
})
