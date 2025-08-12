import { DivePlugin } from "."

import { defaultActions } from "./defaultActions"
import { javascript } from "./javascript"
import { json } from "./json"
import { richPreviews } from "./richPreviews"
import { xml } from "./xml"
import { yaml } from "./yaml"

export const defaultPlugins: DivePlugin[] = [
	json(),
	xml(),
	richPreviews(),
	javascript(),
	yaml(),
	defaultActions(),
]
