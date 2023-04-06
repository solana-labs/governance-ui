import { RichTextEditor } from '@hub/components/controls/RichTextEditor';
import cx from '@hub/lib/cx';
import { isEmpty } from '@hub/lib/richText';
import { RichTextDocument } from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  document: null | RichTextDocument;
  placeholder?: string;
  onDocumentChange?(document: null | RichTextDocument): void;
}

export function FieldRichTextEditor(props: Props) {
  return (
    <RichTextEditor
      className={cx(
        'bg-zinc-50',
        'border-zinc-300',
        'border',
        'min-h-[80px]',
        'p-3',
        'outline-none',
        'rounded-md',
        'text-neutral-900',
        'transition-colors',
        'hover:border-zinc-400',
        'focus:border-sky-500',
        'placeholder:text-neutral-400',
        props.className,
      )}
      defaultDocument={props.document || undefined}
      placeholder={props.placeholder}
      onChange={(document) => {
        const value = isEmpty(document) ? null : document;
        props.onDocumentChange?.(value);
      }}
    />
  );
}
