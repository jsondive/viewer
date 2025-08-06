import { unreachable } from "@jsondive/library"
import _ from "lodash"
import { DateTime } from "luxon"

export type DateInterpretation = {
	date: DateTime
	/**
	 * If false, date was interpreted as being in the browser's local zone
	 * which may be wrong.
	 */
	isPreciseZone: boolean
}

const MIN_YEAR = 1970
const MAX_YEAR = 2100

export const tryInterpretDateValue = _.memoize(
	(value: string | number): undefined | DateInterpretation => {
		if (typeof value === "string") {
			const baseDateMatch = value.match(/^(\d{4})-\d{1,2}-\d{1,2}/)
			if (!baseDateMatch) {
				return
			}

			const year = Number(baseDateMatch[1])
			if (year < MIN_YEAR || year > MAX_YEAR) {
				return
			}

			const isoDate = DateTime.fromISO(value)
			if (isoDate.isValid) {
				return { date: isoDate, isPreciseZone: true }
			}

			const jsDate = new Date(value)
			if (!isNaN(jsDate.getTime())) {
				return {
					date: DateTime.fromJSDate(jsDate),
					isPreciseZone: false,
				}
			}
		} else if (typeof value === "number") {
			const [pastDate, futureDate] = getPastAndFutureDate()
			for (const candidateValue of [value, value * 1000]) {
				if (
					candidateValue >= pastDate.toMillis() &&
					candidateValue <= futureDate.toMillis()
				) {
					return {
						date: DateTime.fromMillis(candidateValue),
						isPreciseZone: true,
					}
				}
			}
		} else {
			unreachable(value)
		}
	}
)

const EPOCHS_RECOGNIZED_WITHIN_YEARS = 20

const getPastAndFutureDate = _.memoize((): [DateTime, DateTime] => {
	const now = DateTime.utc()
	return [
		now.minus({ years: EPOCHS_RECOGNIZED_WITHIN_YEARS }),
		now.plus({ years: EPOCHS_RECOGNIZED_WITHIN_YEARS }),
	]
})
