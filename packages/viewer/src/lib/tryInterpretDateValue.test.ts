import { it, expect } from "@jest/globals"
import { tryInterpretDateValue } from "./tryInterpretDateValue"
import assert from "node:assert"
import { DateTime } from "luxon"

it("interprets an ISO date", () => {
	const result = tryInterpretDateValue(`2025-08-05T00:00:00.000Z`)
	assert(result)
	expect(result.date.valueOf()).toEqual(
		DateTime.fromISO(`2025-08-05T00:00:00.000Z`).valueOf()
	)
})

it("does not match a single number", () => {
	const result = tryInterpretDateValue(`23`)
	expect(result).not.toBeDefined()
})

it("does not match a lone year", () => {
	const result = tryInterpretDateValue(`2023`)
	expect(result).not.toBeDefined()
})

it("matches a date without timestamp", () => {
	const date = tryInterpretDateValue(`2023-05-01`)
	assert(date)
	expect(date.date.toISO()).toEqual(
		DateTime.fromObject({
			year: 2023,
			month: 5,
			day: 1,
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0,
		}).toISO()
	)
})

it("does not match a date that's super far in the past", () => {
	const result = tryInterpretDateValue(`1800-05-01`)
	expect(result).not.toBeDefined()
})

it("does not match a date that's super far in the future", () => {
	const result = tryInterpretDateValue(`2600-01-01`)
	expect(result).not.toBeDefined()
})
