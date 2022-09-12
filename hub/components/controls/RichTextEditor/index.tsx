// @ts-ignore
import type { Editor, EditorState } from 'draft-js';
import React, { forwardRef, useEffect, useState } from 'react';

import type { fromEditorState, toEditorState } from '@hub/lib/richText';
import { RichTextDocument } from '@hub/types/RichTextDocument';

interface Utilities {
  fromEditorState: typeof fromEditorState;
  toEditorState: typeof toEditorState;
}

interface Props {
  className?: string;
  defaultDocument?: RichTextDocument;
  placeholder?: string;
  onBlur?(): void;
  onChange?(document: RichTextDocument): void;
  onClick?(): void;
  onFocus?(): void;
}

export const RichTextEditor = forwardRef<Editor, Props>(function RichTextEditor(
  props: Props,
  ref,
) {
  const [EditorComponent, setEditor] = useState<typeof Editor | null>(null);
  const [state, setState] = useState<EditorState | null>(null);
  const [utilities, setUtilities] = useState<Utilities | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Promise.all([
        // @ts-ignore
        import('draft-js'),
        import('@hub/lib/richText'),
        import('./styles'),
      ]).then(([{ Editor, EditorState }, utilities]) => {
        if (props.defaultDocument) {
          setState(utilities.toEditorState(props.defaultDocument));
        } else {
          setState(EditorState.createEmpty());
        }
        setEditor(() => Editor);
        setUtilities({
          fromEditorState: utilities.fromEditorState,
          toEditorState: utilities.toEditorState,
        });
      });
    }
  }, [setEditor]);

  return (
    <div className={props.className} onClick={props.onClick}>
      {EditorComponent && state && utilities && (
        <EditorComponent
          editorState={state}
          placeholder={props.placeholder}
          ref={ref}
          tabIndex={0}
          onBlur={props.onBlur}
          onChange={(state: EditorState) => {
            setState(state);
            props.onChange?.(utilities.fromEditorState(state));
          }}
          onFocus={props.onFocus}
        />
      )}
    </div>
  );
});
