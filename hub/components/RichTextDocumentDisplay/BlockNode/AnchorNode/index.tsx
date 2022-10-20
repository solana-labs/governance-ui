import { InlineNode } from '../InlineNode';
import { PublicKeyNode } from '../PublicKeyNode';
import { ExternalLink } from '@hub/components/icons/ExternalLink';
import cx from '@hub/lib/cx';
import {
  AnchorNode as AnchorNodeModel,
  InlineNodeType,
} from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  anchor: AnchorNodeModel;
}

export function AnchorNode(props: Props) {
  return (
    <a
      className={cx(
        props.className,
        'text-sky-500',
        'cursor-pointer',
        'inline-flex',
        'items-center',
        'align-baseline',
        'truncate',
        'hover:text-sky-400',
      )}
      href={props.anchor.u}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {props.anchor.c.map((child, i) =>
        child.t === InlineNodeType.Inline ? (
          <InlineNode className="transition-colors" node={child} key={i} />
        ) : (
          <PublicKeyNode className="transition-colors" node={child} key={i} />
        ),
      )}
      <ExternalLink
        className={cx(
          'fill-current',
          'h-[1em]',
          'ml-0.5',
          'transition-colors',
          'w-[1em]',
        )}
      />
    </a>
  );
}
