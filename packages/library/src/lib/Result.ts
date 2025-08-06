export type Result<S, F> = Success<S> | Fail<F>

export type Success<S> = { value: S; error?: undefined }

export type Fail<F> = { error: F }

export const Result = {
	isSuccess<S, F>(r: Result<S, F>): r is Success<S> {
		return !r.error
	},

	isFail<S, F>(r: Result<S, F>): r is Fail<F> {
		return !!r.error
	},

	toOptional<S>(result: Result<S, unknown>): S | undefined {
		if (Result.isSuccess(result)) {
			return result.value
		}
	},

	/**
	 * Wrap `fn`, catching errors and turning them into results.
	 */
	wrap<T>(fn: () => T): Result<T, Error> {
		try {
			return { value: fn() }
		} catch (err) {
			return { error: err as Error }
		}
	},

	async wrapAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
		try {
			return { value: await fn() }
		} catch (err) {
			return { error: err as Error }
		}
	},

	unwrap<T>(result: Result<T, unknown>): T {
		if (Result.isFail(result)) {
			throw result.error
		}

		return result.value
	},

	mapError<S, F, E>(result: Result<S, F>, fn: (error: F) => E): Result<S, E> {
		if (Result.isSuccess(result)) {
			return result
		}

		return { error: fn(result.error) }
	},
}
