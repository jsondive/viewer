import { objectKeys, unreachable } from "../utils"

export const ArrowRight = Symbol("ArrowRight")
export const ArrowLeft = Symbol("ArrowLeft")
export const ArrowUp = Symbol("ArrowUp")
export const ArrowDown = Symbol("ArrowDown")
export const Enter = Symbol("Enter")
export const Escape = Symbol("Escape")

export type SpecialKey =
	| typeof ArrowRight
	| typeof ArrowLeft
	| typeof ArrowUp
	| typeof ArrowDown
	| typeof Enter
	| typeof Escape

function isSpecialKey(key: string | SpecialKey): key is SpecialKey {
	if (
		key === ArrowUp ||
		key === ArrowDown ||
		key === ArrowRight ||
		key === ArrowLeft ||
		key === Enter ||
		key === Escape
	) {
		return true
	}

	key satisfies string
	return false
}

const modifierKeyToAlias = {
	Alt: "alt",
	AltGraph: true,
	CapsLock: true,
	Control: "control",
	Fn: true,
	FnLock: true,
	Hyper: true,
	Meta: "command",
	ScrollLock: true,
	Shift: "shift",
	Super: true,
	Symbol: true,
	SymbolLock: true,
} as const satisfies {
	[K in Exclude<
		React.ModifierKey,
		// Ignore NumLock; we don't care about it, and Firefox appears
		// to pass it where Chrome does not.
		"NumLock"
	>]: string | true
}

type ModifierKey = {
	[K in keyof typeof modifierKeyToAlias]: (typeof modifierKeyToAlias)[K] extends true
		? K
		: (typeof modifierKeyToAlias)[K]
}[keyof typeof modifierKeyToAlias]

type ModifierKeyMap = Partial<Record<ModifierKey, true>>

export type KeyboardBinding =
	| string
	| SpecialKey
	| [string | SpecialKey, ModifierKeyMap]

type ResolvedKeyboardBinding = {
	key: string | SpecialKey
	modifierKeyMap: ModifierKeyMap
}

function resolveKeyboardBinding(
	binding: KeyboardBinding
): ResolvedKeyboardBinding {
	return Array.isArray(binding)
		? {
				key: binding[0],
				modifierKeyMap: binding[1],
			}
		: { key: binding, modifierKeyMap: {} }
}

const aliasToModifierKey = Object.fromEntries(
	Object.entries(modifierKeyToAlias).flatMap(([k, v]) =>
		typeof v === "string" ? [[v, k]] : []
	)
)

const ALL_MODIFIER_KEYS = Object.keys(modifierKeyToAlias) as React.ModifierKey[]

/** A native **or** React keyboard event. They're mostly type-compatible. */
export type AnyKeyboardEvent = React.KeyboardEvent | KeyboardEvent

export function keyToDescription(binding: KeyboardBinding) {
	const { key, modifierKeyMap } = resolveKeyboardBinding(binding)

	let result: string
	if (isSpecialKey(key)) {
		if (key === ArrowLeft) {
			result = "←"
		} else if (key === ArrowRight) {
			result = "→"
		} else if (key === ArrowUp) {
			result = "↑"
		} else if (key === ArrowDown) {
			result = "↓"
		} else if (key === Enter) {
			result = "⏎"
		} else if (key === Escape) {
			result = "⎋"
		} else {
			unreachable(key)
		}
	} else {
		result = key.toUpperCase()
	}

	if (modifierKeyMap.shift) {
		result = "⇧" + result
	}

	if (modifierKeyMap.command) {
		result = "⌘" + result
	}

	return result
}

export function keyMatch(
	event: AnyKeyboardEvent,
	binding: KeyboardBinding
): boolean {
	const requiredModifiers: React.ModifierKey[] = []

	const resolved = resolveKeyboardBinding(binding)
	for (const modifierKeyAlias of objectKeys(resolved.modifierKeyMap)) {
		requiredModifiers.push(
			aliasToModifierKey[modifierKeyAlias] as React.ModifierKey
		)
	}

	let key = resolved.key
	if (isSpecialKey(key)) {
		key = key.description!
	}

	if (
		event.key.toLowerCase() === key.toLowerCase() &&
		ALL_MODIFIER_KEYS.every(
			modifierKey =>
				event.getModifierState(modifierKey) ===
				requiredModifiers.includes(modifierKey)
		)
	) {
		return true
	}

	return false
}
