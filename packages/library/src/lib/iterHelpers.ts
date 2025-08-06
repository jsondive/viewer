export function* zipWithIndex<T>(
	gen: Iterable<T>
): Generator<[index: number, item: T]> {
	let index = 0
	for (const item of gen) {
		yield [index, item]
		index++
	}
}
