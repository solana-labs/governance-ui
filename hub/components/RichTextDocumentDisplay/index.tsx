import cx from '@hub/lib/cx';
import { BlockNodeType, RichTextDocument } from '@hub/types/RichTextDocument';

import { BlockNode } from './BlockNode';
import { ImageNode } from './ImageNode';
import { TwitterEmbedAttachment } from './TwitterEmbedAttachment';
import { TwitterEmbedNode } from './TwitterEmbedNode';

interface Props {
  className?: string;
  document: RichTextDocument;
  excludeBlocks?: BlockNodeType[];
  isClipped?: boolean;
  isPreview?: boolean;
  showExpand?: boolean;
  onExpand?(): void;
}

export function RichTextDocumentDisplay(props: Props) {
  const blocks = props.document.content.filter((block) => {
    if (props.excludeBlocks) {
      return !props.excludeBlocks.includes(block.t);
    }

    return true;
  });

  return (
    <div className={cx(props.className, 'space-y-2')}>
      {blocks.map((node, i) => {
        switch (node.t) {
          case BlockNodeType.Block:
            return (
              <BlockNode
                block={node}
                key={i}
                isClipped={props.isClipped}
                isLast={i === blocks.length - 1}
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
                isLast={i === blocks.length - 1}
                showExpand={props.showExpand}
                onExpand={props.onExpand}
              />
            );
          case BlockNodeType.TwitterEmbed:
            return (
              <TwitterEmbedNode
                embed={node}
                key={i}
                isClipped={props.isClipped}
                isLast={i === blocks.length - 1}
                showExpand={props.showExpand}
                onExpand={props.onExpand}
              />
            );
        }
      })}
      <div>
        {props.document.attachments.map((attachment, i) => (
          <TwitterEmbedAttachment
            attachment={attachment}
            isPreview={props.isPreview}
            key={i}
          />
        ))}
      </div>
    </div>
  );
}
