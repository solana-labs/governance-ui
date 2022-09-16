// @ts-ignore
import type { Editor, EditorState } from 'draft-js';
import React, { useEffect, useRef, useState } from 'react';

import type { fromEditorState, toEditorState } from '@hub/lib/richText';
import { RichTextDocument } from '@hub/types/RichTextDocument';

interface Utilities {
  fromEditorState: typeof fromEditorState;
  toEditorState: typeof toEditorState;
}

interface Props {
  className?: string;
  autoFocus?: boolean;
  defaultDocument?: RichTextDocument;
  placeholder?: string;
  onBlur?(): void;
  onChange?(document: RichTextDocument): void;
  onClick?(): void;
  onFocus?(): void;
}

export function RichTextEditor(props: Props) {
  const [EditorComponent, setEditor] = useState<typeof Editor | null>(null);
  const [state, setState] = useState<EditorState | null>(null);
  const [utilities, setUtilities] = useState<Utilities | null>(null);
  const ref = useRef<Editor>(null);

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

  useEffect(() => {
    if (EditorComponent && ref.current && props.autoFocus) {
      ref.current.focus();
    }
  }, [props.autoFocus, ref, EditorComponent]);

  return (
    <div
      className={props.className}
      onClick={() => {
        if (ref.current) {
          ref.current.focus();
        }
        props.onClick?.();
      }}
    >
      {EditorComponent && state && utilities && (
        <EditorComponent
          autoFocus={props.autoFocus}
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
}
