import { buildJsonPath } from "./buildJsonPath"

it("root", () => {
	expect(buildJsonPath([])).toEqual("$")
})

it("simple", () => {
	expect(buildJsonPath(["foo", "bar"])).toEqual("foo.bar")
})

it("path part with dot", () => {
	expect(buildJsonPath(["foo", "bar.baz"])).toEqual(`foo["bar.baz"]`)
})

it("path part with space", () => {
	expect(buildJsonPath(["foo", "bar baz"])).toEqual(`foo["bar baz"]`)
})

it("handles an object with a number key", () => {
	expect(buildJsonPath(["foo", "0"])).toEqual(`foo["0"]`)
})

it("handles an array", () => {
	expect(buildJsonPath(["foo", 0])).toEqual(`foo[0]`)
})
