export type JSONDiveOptions = {
	onValueMagnified?: (args: { value: string }) => void

	/**
	 * If set, never show the path bar which is shown when a node
	 * is selected/focused.
	 */
	hidePathBar?: boolean
}
