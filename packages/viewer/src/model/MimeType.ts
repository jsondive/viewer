export enum MimeType {
	Json = "application/json",
	Xml = "text/xml",
	JsonLines = "application/x-ndjson",
	Csv = "text/csv",
	OctetStream = "application/octet-stream",
	JavaScript = "text/javascript",
	Yaml = "application/yaml",
}

export function isMimeType(s: string): s is MimeType {
	return Object.values(MimeType).includes(s as MimeType)
}
