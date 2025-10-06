import { placeholder } from "@/index"
import { expect, test } from "vitest"

test("placeholder", () => expect(placeholder(1, 2)).toBeCloseTo(3))
