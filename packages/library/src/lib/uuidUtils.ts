export function removeDashesFromUuid(uuid: string) {
	return uuid.replace(/-/g, "")
}

export function addDashesToUuid(uuid: string) {
	return uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5")
}
