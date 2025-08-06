import { it, expect } from "@jest/globals"
import { detectFileType } from "./detectFileType"
import { MimeType } from "../model/MimeType"

it("simple JSON", () => {
	expect(detectFileType(JSON.stringify({ foo: "bar" }))).toEqual(MimeType.Json)
})

it("json with whitespace at front", () => {
	expect(detectFileType(`    {"foo": 2}`)).toEqual(MimeType.Json)
})

it("json array", () => {
	expect(detectFileType(`[1, 2, 3]`)).toEqual(MimeType.Json)
})

it("simple xml", () => {
	expect(detectFileType(`<foo></foo>`)).toEqual(MimeType.Xml)
})

it("xml with whitespace at front", () => {
	expect(detectFileType(`     <foo></foo>`)).toEqual(MimeType.Xml)
})

it("not xml or json", () => {
	expect(detectFileType(`hello, world`)).toEqual(MimeType.OctetStream)
})

it("javascript", () => {
	expect(detectFileType(`{foo: 2}`)).toEqual(MimeType.JavaScript)
})

it("javascript with quoted literal first", () => {
	expect(detectFileType(`{"foo": {bar: 3 }}`)).toEqual(MimeType.JavaScript)
})

it("javascript with index expression", () => {
	expect(detectFileType(`{"foo": {["bar"]: 3 }}`)).toEqual(MimeType.JavaScript)
})

it("returns JSON if there's a URL", () => {
	expect(detectFileType(`{"url": "https://google.com"}`)).toEqual(MimeType.Json)
})

describe("yaml", () => {
	it("works for a simple document", () => {
		expect(detectFileType([`foo: "bar"`, `bar: 2`].join("\n"))).toEqual(
			MimeType.Yaml
		)
	})

	it("works for a document with an array", () => {
		expect(detectFileType([` - foo`, ` - bar`].join("\n"))).toEqual(
			MimeType.Yaml
		)
	})
})

it("works for JSON Lines", () => {
	expect(detectFileType(`{"foo":"bar"}\n{"bar":"baz"}\n`)).toEqual(
		MimeType.JsonLines
	)
})
