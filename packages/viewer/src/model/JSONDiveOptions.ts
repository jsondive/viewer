import { IconComponent } from "@jsondive/library"

export type IconPack = {
	/**
	 * Icon used when a value is collapsed for a button to expand the value.
	 */
	magnify?: IconComponent

	/**
	 * Icon used when an image URL is shown; user may hover over this icon
	 * to show a preview of the image.
	 *
	 * (Only if the richPreviews plugin is active.)
	 */
	image?: IconComponent
}

export type JSONDiveOptions = {
	onValueMagnified?(args: { value: string }): void

	icons?: IconPack
}
