/**
 * lucide-react has its own LucideIcon type, but I can't get the types
 * to interop across library boundaries; there's some kind of mismatch
 * with the `ref` property.
 */
export type LucideIcon = React.FC<{ size: number }>
