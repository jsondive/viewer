export type OperatingSystem =
	| "mac_os"
	| "ios"
	| "windows"
	| "android"
	| "linux"
	| "unknown"

const macosPlatforms = [
	"macOS",
	"Macintosh",
	"MacIntel",
	"MacPPC",
	"Mac68K",
	"darwin",
]
const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"]
const iosPlatforms = ["iPhone", "iPad", "iPod"]

export function getOperatingSystem(): OperatingSystem {
	// https://stackoverflow.com/a/38241481

	const userAgent = window.navigator.userAgent
	const platform = window.navigator.platform

	if (macosPlatforms.indexOf(platform) !== -1) {
		return "mac_os"
	} else if (iosPlatforms.indexOf(platform) !== -1) {
		return "ios"
	} else if (windowsPlatforms.indexOf(platform) !== -1) {
		return "windows"
	} else if (/Android/.test(userAgent)) {
		return "android"
	} else if (/Linux/.test(platform)) {
		return "linux"
	}

	return "unknown"
}
