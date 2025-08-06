import { LoaderCircle, LucideProps } from "lucide-react"
import * as stylex from "@stylexjs/stylex"

const spin = stylex.keyframes({
	"0%": {
		transform: "rotate(0deg)",
	},
	"100%": {
		transform: "rotate(360deg)",
	},
})

const styles = stylex.create({
	wrap: {
		animationName: spin,
		animationDuration: "1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
	},
})

export function LoadingSpinner(props: LucideProps) {
	return <LoaderCircle {...props} {...stylex.props(styles.wrap)} />
}
