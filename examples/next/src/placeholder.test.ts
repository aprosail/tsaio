import { placeholder } from "@/placeholder"
import { expect, test } from "vitest"

test("placeholder", () => expect(placeholder(1, 2)).toBeCloseTo(3))
