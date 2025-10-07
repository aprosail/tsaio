import { hashPosition } from "@tsaio/hash"
import { createHash } from "node:crypto"

/**
 * A css variable, a unique name.
 * Such type is just for dev propose.
 * It will become just a string after the transform.
 */
export type CssVariable = string & { __cssVariable: true }

/**
 * A css class connected to a css code block in ts,
 * which will be transferred and resolved as css module.
 * Such type is just for dev propose.
 * It will become just a string after the transform.
 */
export type CssClass = string & { __cssClass: true }

/**
 * Create a unique css variable.
 *
 * The returned value will be the name of current css variable
 * after the transform, but it will return a unique hash value
 * in dev mode runtime, which is not the exact name after transform.
 */
export function cssVariable() {
  return `--v-${hashPosition(3)}` as CssVariable
}

/**
 * Create a css class.
 *
 * The returned value will be the name of current css class
 * after the transform, but it will return a unique hash value
 * in dev mode runtime, which is not the exact name after transform.
 */
export function css(template: TemplateStringsArray, ...args: CssVariable[]) {
  const content = template.map((str, i) => `${str}${args[i] || ""}`).join("")
  const hash = createHash("sha256")
  hash.update(content)
  return `cm${hash.digest("hex").slice(0, 16)}` as CssClass
}
