import { EditorView } from "codemirror"
import { EditorState } from "@codemirror/state"
import { keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, drawSelection } from "@codemirror/view"
import { bracketMatching } from "@codemirror/language"
import { defaultKeymap } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { json } from "@codemirror/lang-json"
import { customViewerTheme } from "./theme.js"

export function createRawDataViewer(parent, doc) {
	return new EditorView({
		parent,
		state: EditorState.create({
			doc,
			extensions: [
				lineNumbers(), highlightActiveLine(), highlightActiveLineGutter(),
				highlightSpecialChars(), drawSelection(), bracketMatching(),
				highlightSelectionMatches(), keymap.of([...defaultKeymap, ...searchKeymap]),
				customViewerTheme, EditorState.readOnly.of(true), EditorView.lineWrapping, json(),
			],
		}),
	})
}
