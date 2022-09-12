import cx from '@hub/lib/cx';
import { BlockNodeType, RichTextDocument } from '@hub/types/RichTextDocument';

import { BlockNode } from './BlockNode';
import { ImageNode } from './ImageNode';

interface Props {
  className?: string;
  document: RichTextDocument;
  isClipped?: boolean;
  showExpand?: boolean;
  onExpand?(): void;
}

export function RichTextDocumentDisplay(props: Props) {
  return (
    <div className={cx(props.className, 'space-y-2')}>
      {props.document.content.map((node, i) => {
        switch (node.t) {
          case BlockNodeType.Block:
            return (
              <BlockNode
                block={node}
                key={i}
                isClipped={props.isClipped}
                isLast={i === props.document.content.length - 1}
                showExpand={props.showExpand}
                onExpand={props.onExpand}
              />
            );
          case BlockNodeType.Image:
            return (
              <ImageNode
                image={node}
                key={i}
                isClipped={props.isClipped}
                isLast={i === props.document.content.length - 1}
                showExpand={props.showExpand}
                onExpand={props.onExpand}
              />
            );
        }
      })}
    </div>
  );
}
