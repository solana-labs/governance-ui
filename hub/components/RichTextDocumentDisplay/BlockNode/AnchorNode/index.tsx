import { InlineNode } from '../InlineNode';
import cx from '@hub/lib/cx';
import { AnchorNode as AnchorNodeModel } from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  anchor: AnchorNodeModel;
}

export function AnchorNode(props: Props) {
  return (
    <a
      className={cx(
        props.className,
        'text-cyan-500',
        'cursor-pointer',
        'transition-colors',
        'truncate',
        'hover:text-cyan-400',
      )}
      href={props.anchor.u}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {props.anchor.c.map((child, i) => (
        <InlineNode node={child} key={i} />
      ))}
    </a>
  );
}
