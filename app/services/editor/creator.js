/**
 * Vendor
 */
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { EditorView } from "@codemirror/view"

export const createTheme = ({ styles }) => {
	const theme = EditorView.theme(
		{
			"&": {
				backgroundColor: "transparent",
				color: "var(--txt-primary)",

				height: "100%",

				"--indent-marker-bg-color": "var(--op-5)",
				"--indent-marker-active-bg-color": "var(--op-20)",
			},
			".cm-content": {
				caretColor: "var(--txt-tertiary)",
			},
			".cm-cursor, .cm-dropCursor": {
				borderLeftColor: "var(--txt-tertiary)",
				borderRadius: "5px",
			},
			"&.cm-focused": {
				outline: "1px solid transparent",
			},
			"&.cm-focused .cm-matchingBracket": {
				backgroundColor: "var(--op-15)",
			},
			"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
				background: "var(--op-10)",
			},
			".cm-activeLine": {
				backgroundColor: "var(--op-5)",
				borderRadius: "0 5px 5px 0",
			},
			".cm-gutters": {
				backgroundColor: "transparent",
				color: "var(--txt-tertiary)",
			},
			".cm-gutterElement span": {
				opacity: "0",
				transition: "all .2s ease",
			},
			".cm-gutters:hover .cm-gutterElement span": {
				opacity: "1",
			},
			".cm-gutter.cm-lineNumbers .cm-activeLineGutter": {
				borderRadius: "5px 0 0 5px",
				color: "var(--txt-secondary)",
			},
			".cm-activeLineGutter": {
				backgroundColor: "var(--op-5)",
			},
			".cm-scroller": {
				fontFamily: "JetBrains Mono",
				fontSize: "14px",
				fontWeight: "600",
				lineHeight: "1.6",
				paddingRight: "12px",
				paddingTop: "8px",
			},
			".cm-scroller::-webkit-scrollbar-track": {
				height: "2px",
			},
			".cm-placeholder": {
				color: "var(--txt-tertiary)",
			},
			".cm-selectionMatch": {
				background: "transparent",
				outline: "1px solid var(--txt-support)",
				borderRadius: "2px",
			},
			".cm-panels": {
				background: "transparent",
			},
			".cm-panel.cm-search": {
				background: "var(--app-background)",
				border: "2px solid var(--op-5)",
				borderRadius: "6px",
			},
			".cm-textfield": {
				fontSize: "80%",
				borderRadius: "3px",
				border: "1px solid var(--op-10)",
			},
			".cm-button": {
				borderRadius: "3px",
				background: "var(--op-5)",
				border: "1px solid var(--op-15)",
				textTransform: "capitalize",
			},
			".cm-search label": {
				textTransform: "capitalize",
			},
			".cm-line": {
				padding: "0 12px 0 6px",
			},
			".cm-tooltip.cm-tooltip-autocomplete": {
				background: "#18181A",
				border: "1px solid var(--op-5)",
				borderRadius: "6px",
				padding: "6px",
			},
			".cm-tooltip.cm-tooltip-autocomplete > ul": {
				display: "flex",
				flexDirection: "column",
				gap: "2px",
				fontFamily: "JetBrains Mono",
				fontSize: "13px",
				paddingRight: "8px",
			},
			".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
				display: "flex",
				alignItems: "center",
				borderRadius: "4px",
				minHeight: "26px",

				padding: "0 6px",

				transition: "all .1s var(--bezier)",
			},
			".cm-tooltip-autocomplete ul li:hover": {
				background: "rgba(255,255,255, 5%)",
			},
			".cm-tooltip-autocomplete ul li[aria-selected]": {
				background: "rgba(255,255,255, 8%)",
			},
			".cm-completionIcon": {
				display: "none",
			},
			".cm-completionLabel": {
				fontWeight: "800",
				color: "var(--txt-secondary)",
			},
			".cm-completionMatchedText": {
				fontWeight: "800",
				color: "var(--txt-primary)",
				textDecoration: "none",
			},
			".cm-completionDetail": {
				fontWeight: "700",
				color: "var(--txt-tertiary)",
				fontStyle: "initial",
				overflow: "hidden",
				textOverflow: "ellipsis",
			},
			".cm-completionDocs": {
				fontWeight: "700",
				color: "var(--txt-support)",
				marginLeft: "0.5em",
			},
			".cm-completionSymbol": {
				minWidth: "16px",
				minHeight: "16px",
				marginRight: "0.5em",
			},
			".cm-tooltip.cm-completionInfo": {
				background: "#18181A",
				borderRadius: "5px",
				border: "1px solid var(--op-5)",
				padding: "6px",
				left: "102%",
			},
			".cm-tooltip.cm-completionInfo > div": {
				fontSize: "12px",
				color: "var(--txt-tertiary)",
				fontWeight: "500",
			},
			".cm-tooltip": {
				background: "transparent",
			},
			".cm-tooltip-lint": {
				display: "flex",
				flexDirection: "column",
				gap: "8px",
				background: "#18181A",
				borderRadius: "6px",
				border: "2px solid var(--op-5)",
				padding: "6px",
			},
			".cm-diagnosticText": {
				fontSize: "13px",
				color: "var(--txt-secondary)",
				fontWeight: "600",
			},
			".cm-diagnostic-error": {
				borderLeft: "3px solid #EB5757",
			},
			".cm-diagnosticAction": {
				background: `var(--op-10)`,
				borderRadius: "4px",
				padding: "2px 4px",
				fontSize: "12px",
				fontWeight: 600,
				color: "var(--txt-secondary)",
				transition: "all .2s var(--bezier)",
			},
			".cm-diagnosticAction:hover": {
				background: `var(--op-20)`,
				color: "var(--txt-primary)",
			},
		},
		{
			dark: true,
		},
	)

	const highlightStyle = HighlightStyle.define(styles)
	const extension = [theme, syntaxHighlighting(highlightStyle)]

	return extension
}
