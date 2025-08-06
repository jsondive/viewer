import { Result } from "./lib/Result"

export function unreachable(x: never): never {
	throw new Error(`Expected value never to occur: ${JSON.stringify(x)}`)
}

export function isDefined<T>(value: T | undefined): value is T {
	return value !== undefined
}

export function tryParseJson<T = unknown>(input: string): Result<T, Error> {
	return Result.wrap(() => JSON.parse(input))
}

export function tryParseUrl(input: string): Result<URL, Error> {
	return Result.wrap(() => new URL(input))
}

export function tryDecodeText(input: ArrayBuffer): Result<string, Error> {
	const decoder = new TextDecoder("utf-8", { fatal: true })
	try {
		return {
			value: decoder.decode(input),
		}
	} catch (err) {
		return {
			error: err as Error,
		}
	}
}

/**
 * https://www.totaltypescript.com/the-empty-object-type-in-typescript
 */
export type EmptyObject = Record<string, never>

type ObjectEntry<T> = T extends unknown
	? {
			[K in Exclude<keyof T, symbol>]: [K, T[K]]
		}[Exclude<keyof T, symbol>]
	: never

export const objectEntries = Object.entries as <T>(
	o: T
) => Array<ObjectEntry<T>>

export function intersperseArray<Value, IntersperseValue>(
	array: Array<Value>,
	createIntersperseValue: (index: number) => IntersperseValue
) {
	const newArray: Array<Value | IntersperseValue> = []
	array.forEach((value, index) => {
		newArray.push(value)
		if (array[index + 1]) {
			newArray.push(createIntersperseValue(index))
		}
	})
	return newArray
}

export type Assert<T, V extends T> = V

type StringKeyOfObject<T> = T extends unknown ? Exclude<keyof T, symbol> : never

export const objectKeys = Object.keys as <T>(
	obj: T
) => Array<StringKeyOfObject<T>>

export type Constructor<T> = {
	new (...args: any[]): T
}

export function negativeWrappingModulo(n: number, m: number) {
	// https://stackoverflow.com/a/4467559
	return ((n % m) + m) % m
}
