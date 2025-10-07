import { useMemo } from "react"
import { getOperatingSystem } from "../lib/getOperatingSystem"

/**
 * Component that renders a platform-specific meta key
 * (command on macOS, control on Windows.)
 */
export function MetaKey() {
	const os = useMemo(() => getOperatingSystem(), [])
	return os === "windows" ? "Ctrl" : "⌘"
}
