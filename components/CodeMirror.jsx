import { useEffect, useRef, useState } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import {
  defaultKeymap,
  history,
  indentWithTab,
  redo,
  undo,
} from "@codemirror/commands";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
} from "@codemirror/language";
import { linter } from "@codemirror/lint";
import { json, jsonParseLinter } from "@codemirror/lang-json";

export default function CodeMirror({ value, onChange = () => {} }) {
  const ref = useRef();
  const view = useRef();

  useEffect(() => {  
    view.current = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          // Default onChangeAction in case there is not onChange props.
          // look the line 77.
          //onChangeAction.of(EditorView.updateListener.of(() => {})),
          EditorView.updateListener.of(view => {
            if (view.docChanged) onChange({ target: { value: view.state.doc.toString() } })
          }),
          history(),
          keymap.of([
            ...defaultKeymap,
            indentWithTab,
            { key: "Mod-z", run: undo, preventDefault: true },
            { key: "Mod-Shift-z", run: redo, preventDefault: true }
          ]),
          // Set the tabSize of the editor.
          EditorState.tabSize.of(2),
          lineNumbers(),
          bracketMatching(),
          // Support .json files. This could be change in the future
          // with a better implementation.
          json(),
          linter(jsonParseLinter()),
          syntaxHighlighting(defaultHighlightStyle)
        ]
      }),
      parent: ref.current
    });

    // Every re-render, we destroy the current instance
    // and create another one with the new values.
    return () => {
      view.current.destroy();
      view.current = null;
    };
  }, []);

  useEffect(() => {
    if (view) {
      const editorValue = view.current.state.doc.toString();

      if (value !== editorValue) {
        view.current.dispatch({
          changes: {
            from: 0,
            to: editorValue.length,
            insert: value || "",
          },
        });
      }
    }
  }, [value, view]);

  return (
    <div style={{ height: "100%", backgroundColor: "white" }}>
      <div ref={ref} />
    </div>
  );
}
