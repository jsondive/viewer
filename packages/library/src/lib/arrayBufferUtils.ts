export function arrayBufferToBase64(buffer: ArrayBuffer): string {
	let binary = ""
	const bytes = new Uint8Array(buffer)
	const len = bytes.byteLength
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i])
	}
	// URL safe base64: https://chatgpt.com/share/686acce0-dbc4-8011-b846-6018d7c3e5f6
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function base64ToArrayBuffer(urlSafeBase64: string): ArrayBuffer {
	const base64 = urlSafeBase64.replace(/-/g, "+").replace(/_/g, "/")
	const binary = atob(base64)
	const len = binary.length
	const buffer = new ArrayBuffer(len)
	const bytes = new Uint8Array(buffer)
	for (let i = 0; i < len; i++) {
		bytes[i] = binary.charCodeAt(i)
	}
	return buffer
}

export function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
	// https://stackoverflow.com/a/54646864
	return array.buffer.slice(
		array.byteOffset,
		array.byteLength + array.byteOffset
	) as ArrayBuffer
}
