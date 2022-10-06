import cx from '@hub/lib/cx';
import {
  InlineNode as InlineNodeModel,
  InlineStyle,
} from '@hub/types/RichTextDocument';

function getStyle(style: InlineStyle) {
  switch (style) {
    case InlineStyle.Bold:
      return 'font-bold';
    case InlineStyle.Code:
      return 'whitespace-pre px-2 py-1 bg-neutral-200';
    case InlineStyle.Italic:
      return 'italic';
    case InlineStyle.Small:
      return 'text-xs';
    case InlineStyle.Strikethrough:
      'line-through';
    case InlineStyle.Underline:
      'underline';
  }
}

interface Props {
  className?: string;
  node: InlineNodeModel;
}

export function InlineNode(props: Props) {
  return (
    <span
      className={cx(
        props.className,
        props.node.s && props.node.s.map(getStyle).join(' '),
      )}
    >
      {props.node.c}
    </span>
  );
}
