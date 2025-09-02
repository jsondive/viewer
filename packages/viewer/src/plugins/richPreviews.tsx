import _ from "lodash"
import { DivePlugin, INLINE_DECORATION_ICON_SIZE, NodeDecoration } from "."
import { builtinAttribute } from "../model/builtinAttributes"
import {
	Badge,
	isDefined,
	libraryIcons,
	Result,
	tryParseUrl,
} from "@jsondive/library"
import * as stylex from "@stylexjs/stylex"
import { DateTime } from "luxon"
import { useEffect, useMemo, useState } from "react"
import {
	DateInterpretation,
	tryInterpretDateValue,
} from "../lib/tryInterpretDateValue"
import { IconPack } from "../model/JSONDiveOptions"

// TODO: video previews?

const imageExtensions = [".png", ".jpg", ".jpeg", ".webp"]

export const richPreviews = _.memoize(
	(): DivePlugin => ({
		getDecorationsForNode(node, context) {
			const primitiveValue = node.getAttribute(builtinAttribute.primitiveValue)
			if (!primitiveValue) {
				return []
			}

			const stringValue =
				primitiveValue.type === "string" ? primitiveValue.value : undefined
			const numberValue =
				primitiveValue.type === "number" ? primitiveValue.value : undefined

			if (isDefined(stringValue)) {
				const urlResult = tryParseUrl(stringValue)
				if (Result.isSuccess(urlResult)) {
					const decorations: NodeDecoration[] = [
						{
							type: "linkify",
							href: urlResult.value.toString(),
						},
					]

					if (
						imageExtensions.some(ext => urlResult.value.pathname.endsWith(ext))
					) {
						decorations.push(getImageDecoration(stringValue, context.icons))
					}

					return decorations
				}
			}

			const stringOrNumberValue = stringValue ?? numberValue
			if (isDefined(stringOrNumberValue)) {
				const dateInterpretation = tryInterpretDateValue(stringOrNumberValue)
				if (isDefined(dateInterpretation)) {
					return [getDateDecoration(dateInterpretation)]
				}
			}

			return []
		},
	})
)

const styles = stylex.create({
	imagePreviewWrap: {
		display: "flex",
	},

	imagePreviewImage: {
		maxWidth: 200,
		maxHeight: 200,
	},

	dateTooltipWrap: {
		display: "flex",
		flexDirection: "column",
	},

	dateTooltipWarning: {
		color: "var(--json-dive-color-rich-preview-warning)",
		fontWeight: 600,
		maxWidth: 360,
	},
})

function getImageDecoration(
	url: string,
	icons: IconPack | undefined
): NodeDecoration {
	const ImageIcon = icons?.image ?? libraryIcons.Image

	return {
		type: "inline",
		render() {
			return (
				<Badge tooltip={<ImagePreview url={url} />}>
					<ImageIcon size={INLINE_DECORATION_ICON_SIZE} />
				</Badge>
			)
		},
	}
}

function ImagePreview(props: { url: string }) {
	const { url } = props

	// TODO: use <LoadingSpinner />; error state
	return (
		<div {...stylex.props(styles.imagePreviewWrap)}>
			<img {...stylex.props(styles.imagePreviewImage)} src={url} />
		</div>
	)
}

function getDateDecoration(
	dateInterpretation: DateInterpretation
): NodeDecoration {
	return {
		type: "inline",
		render() {
			return (
				<Badge
					tooltip={<DateTooltip dateInterpretation={dateInterpretation} />}
				>
					<UpdatingRelativeDate date={dateInterpretation.date} />
				</Badge>
			)
		},
	}
}

function UpdatingRelativeDate(props: { date: DateTime }) {
	const { date } = props

	const updateInterval = useMemo(() => {
		const minutesDiff = DateTime.utc().diff(date, "minutes").minutes
		if (minutesDiff < 1.5) {
			return 1000 // Update every second.
		} else if (minutesDiff < 60 * 24) {
			return 60 * 1000 // Update every minute.
		} else {
			return undefined // Don't update.
		}
	}, [date])

	const [relativeDate, setRelativeDate] = useState(() => date.toRelative())

	useEffect(() => {
		if (!isDefined(updateInterval)) {
			return
		}

		const intervalHandle = setInterval(() => {
			setRelativeDate(date.toRelative())
		}, updateInterval)
		return () => {
			clearInterval(intervalHandle)
		}
	}, [date, updateInterval])

	return relativeDate
}

function DateTooltip(props: { dateInterpretation: DateInterpretation }) {
	const {
		dateInterpretation: { date, isPreciseZone },
	} = props
	return (
		<div {...stylex.props(styles.dateTooltipWrap)}>
			<div>{date.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)}</div>
			{!isPreciseZone && (
				<div {...stylex.props(styles.dateTooltipWarning)}>
					⚠ We could not detect a time zone for this timestamp, so it was
					interpreted in your local zone.
				</div>
			)}
		</div>
	)
}
