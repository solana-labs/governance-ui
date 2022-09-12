import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  RawDraftContentBlock,
  RawDraftInlineStyleRange,
  RawDraftEntityRange,
  genKey,
  DraftInlineStyleType,
} from 'draft-js';
import isEqual from 'lodash/isEqual';

import {
  RichTextDocument,
  BlockNode,
  InlineNode,
  BlockNodeType,
  InlineNodeType,
  InlineStyle,
  BlockStyle,
  AnchorNode,
} from '@hub/types/RichTextDocument';

type EntityMap = ReturnType<typeof convertToRaw>['entityMap'];

function toInlineStyle(s: string): InlineStyle | undefined {
  switch (s) {
    case 'BOLD':
      return InlineStyle.Bold;
    case 'CODE':
      return InlineStyle.Code;
    case 'ITALIC':
      return InlineStyle.Italic;
    case 'STRIKETHROUGH':
      return InlineStyle.Strikethrough;
    case 'UNDERLINE':
      return InlineStyle.Underline;
  }
}

function fromInlineStyle(s: InlineStyle): DraftInlineStyleType | undefined {
  switch (s) {
    case InlineStyle.Bold:
      return 'BOLD';
    case InlineStyle.Code:
      return 'CODE';
    case InlineStyle.Italic:
      return 'ITALIC';
    case InlineStyle.Strikethrough:
      return 'STRIKETHROUGH';
    case InlineStyle.Underline:
      return 'UNDERLINE';
    case InlineStyle.Small:
      return undefined;
  }
}

function toBlockStyle(s: string): BlockStyle {
  switch (s) {
    case 'paragraph':
      return BlockStyle.P;
    case 'header-one':
      return BlockStyle.H1;
    case 'header-two':
      return BlockStyle.H2;
    case 'header-three':
      return BlockStyle.H3;
    case 'header-four':
      return BlockStyle.H4;
    case 'header-five':
      return BlockStyle.H5;
    case 'header-six':
      return BlockStyle.H6;
    case 'unordered-list-item':
      return BlockStyle.UL;
    case 'ordered-list-item':
      return BlockStyle.OL;
    case 'blockquote':
      return BlockStyle.Blockquote;
    case 'code-block':
      return BlockStyle.Codeblock;
    case 'atomic':
      return BlockStyle.P;
    default:
      return BlockStyle.P;
  }
}

function fromBlockStyle(s: BlockStyle) {
  switch (s) {
    case BlockStyle.P:
      return 'paragraph';
    case BlockStyle.H1:
      return 'header-one';
    case BlockStyle.H2:
      return 'header-two';
    case BlockStyle.H3:
      return 'header-three';
    case BlockStyle.H4:
      return 'header-four';
    case BlockStyle.H5:
      return 'header-five';
    case BlockStyle.H6:
      return 'header-six';
    case BlockStyle.UL:
      return 'unordered-list-item';
    case BlockStyle.OL:
      return 'ordered-list-item';
    case BlockStyle.Blockquote:
      return 'blockquote';
    case BlockStyle.Codeblock:
      return 'code-block';
    default:
      return 'unstyled';
  }
}

function entityToNode<C>(
  entityMap: EntityMap,
  key: string | number,
  content: C,
) {
  const entity = entityMap[key];

  if (!entity) {
    return null;
  }

  switch (entity.type) {
    case 'IMAGE':
      return ({
        t: InlineNodeType.Anchor,
        c: content,
        u: entity.data.src,
      } as unknown) as AnchorNode;
    case 'LINK':
      return ({
        t: InlineNodeType.Anchor,
        c: content,
        u: entity.data.url,
      } as unknown) as AnchorNode;
    default:
      return null;
  }
}

function blockToNode(
  block: RawDraftContentBlock,
  entityMap: EntityMap,
): BlockNode {
  // We're going to step through each character of the block. If the char falls
  // within the interval of either an entity or an inline style, we're going to
  // create a new child from that section.
  const c: BlockNode['c'] = [];
  const text = block.text;

  // This block contains either an entity or some inline styling. We need to
  // handle that.
  if (block.inlineStyleRanges.length || block.entityRanges.length) {
    // What character from the DraftJsBlock have we visited, but not yet added
    // to the canonical BlockNode.
    let curText: string[] = [];
    // Which inline styles apply to the `curText`.
    let curStyles: InlineStyle[] = [];
    // Which entity, if any, is the curText a part of.
    let curEntityKey: number | undefined = undefined;
    // What inline nodes does the current entity already have.
    let curEntityContent: InlineNode[] = [];

    for (let i = 0; i < text.length; i++) {
      // We are concerned with just one character from the text at a time.
      const char = text[i];
      // Which styles are applicable to the character we've visiting
      const newStyles: InlineStyle[] = [];
      // Which entity, if any, does this character belong to.
      let newEntityKey: number | undefined = undefined;

      block.inlineStyleRanges.forEach((range) => {
        // If the character falls within the range of any inline styles, add
        // the style to the style list.
        if (i >= range.offset && i < range.offset + range.length) {
          const style = toInlineStyle(range.style);

          if (style) {
            newStyles.push(style);
          }
        }
      });

      block.entityRanges.forEach((range) => {
        // If the character falls in the range of any entity, mark it. NOTE: an
        // assumption is being made here that a character can only belong to a
        // single entity at a time.
        if (i >= range.offset && i < range.offset + range.length) {
          newEntityKey = range.key;
        }
      });

      // If neither the styles have changed, nor has the entity, assume this
      // character is a part of the previous node.
      if (isEqual(newStyles, curStyles) && newEntityKey === curEntityKey) {
        curText.push(char);
      }
      // Otherwise, we're going to push the existing node to the appropriate
      // parent, and start a new node
      else {
        // If the existing node is empty, don't bother.
        if (curText.length) {
          const node = {
            t: InlineNodeType.Inline as const,
            c: curText.join(''),
            s: curStyles,
          };

          // If the current node is not a part of any entity, then the node's
          // parent is the BlockNode itself.
          if (curEntityKey === undefined) {
            c.push(node);
          }
          // Otherwise, the current node's parent is the entity it belongs to
          else {
            curEntityContent.push(node);

            // If a new entity is being created, push the current entity to the
            // BlockNode and start a new entity.
            if (curEntityKey !== newEntityKey) {
              const node = entityToNode(
                entityMap,
                curEntityKey,
                curEntityContent,
              );

              if (node) {
                c.push(node);
              }

              curEntityContent = [];
            }
          }
        }

        // Since we pushed the old node, we need to establish a new one.
        curText = [char];
        curStyles = newStyles;
      }

      // We're don exploring this character, so update the entity pointer.
      curEntityKey = newEntityKey;
    }

    // We're done exploring each character. At this point, there may be a node
    // that we haven't pushed to any parent yet.
    const remainder = curText.length
      ? {
          t: InlineNodeType.Inline as const,
          c: curText.join(''),
          s: curStyles,
        }
      : undefined;

    // If we do have such a node...
    if (remainder) {
      // If the node is a part of an entity, add it to the entity, then push
      // the entity to the BlockNode
      if (curEntityKey !== undefined) {
        curEntityContent.push(remainder);

        const node = entityToNode(entityMap, curEntityKey, curEntityContent);

        if (node) {
          c.push(node);
        }
      }
      // Otherwise, push the node directly to the BlockNode;
      else {
        c.push(remainder);
      }
    }
  }
  // This block does not have any entities or styling.
  else {
    c.push({
      t: InlineNodeType.Inline,
      c: text,
    });
  }

  return {
    c,
    t: BlockNodeType.Block,
    s: toBlockStyle(block.type),
  };
}

function nodeToBlock(node: BlockNode, entityKeyIdx = 0) {
  const key = genKey();
  const type = fromBlockStyle(node.s);
  const depth = 0;
  const entityRanges: RawDraftEntityRange[] = [];
  const inlineStyleRanges: RawDraftInlineStyleRange[] = [];
  const entityMap: EntityMap = {};

  // Keep track of the current line of text
  let text = '';

  // For each type of inline style, if it is applicable, we need to know at
  // what index the styling starts.
  const styleIndexStart: Record<InlineStyle, number | undefined> = {
    [InlineStyle.Bold]: undefined,
    [InlineStyle.Code]: undefined,
    [InlineStyle.Italic]: undefined,
    [InlineStyle.Strikethrough]: undefined,
    [InlineStyle.Underline]: undefined,
    [InlineStyle.Small]: undefined,
  };

  const keys = Object.keys(styleIndexStart) as InlineStyle[];

  function handleInlineNode(inlineNode: InlineNode) {
    // For every possible inline style, if that specific style no longer
    // applies to the node we're looking at, we need to close out its
    // applicable range.
    keys.forEach((style) => {
      const offset = styleIndexStart[style];

      // The style was started, but does not apply to this node.
      if (
        offset !== undefined &&
        !(inlineNode.s || []).find((s) => s === style)
      ) {
        const endIndex = text.length;
        const inlineStyle = fromInlineStyle(style);

        if (inlineStyle) {
          inlineStyleRanges.push({
            offset,
            style: inlineStyle,
            length: endIndex - offset,
          });
          styleIndexStart[style] = undefined;
        }
      }
    });

    // For all the styles on this node, if it hasn't already been done, we need
    // to being its range.
    inlineNode.s?.forEach((style) => {
      if (styleIndexStart[style] === undefined) {
        styleIndexStart[style] = text.length;
      }
    });

    // Add the node content to this block.
    text = text + inlineNode.c;
  }

  for (const nodeChild of node.c) {
    // In the case of an anchor node, we need to convert the node into an
    // entity. After we do that, we can handle its contents like a regular
    // list of inline nodes.
    if (nodeChild.t === InlineNodeType.Anchor) {
      const type = 'LINK';
      const mutability = 'MUTABLE' as const;
      const data = { url: nodeChild.u };
      const entity = { type, mutability, data };
      const offset = text.length;
      const length = nodeChild.c.reduce((acc, c) => acc + c.c.length, 0);

      entityRanges.push({
        key: entityKeyIdx,
        offset,
        length,
      });
      entityMap[entityKeyIdx] = entity;
      entityKeyIdx++;

      // Now that the entity is created, handle the children like regular
      // inline nodes.
      for (const child of nodeChild.c) {
        handleInlineNode(child);
      }
    } else {
      handleInlineNode(nodeChild);
    }
  }

  // For all the style ranges that have been established, add them to the block
  keys.forEach((style) => {
    const offset = styleIndexStart[style];
    if (offset !== undefined) {
      const endIndex = text.length;
      const inlineStyle = fromInlineStyle(style);

      if (inlineStyle) {
        inlineStyleRanges.push({
          offset,
          style: inlineStyle,
          length: endIndex - offset,
        });
      }
    }
  });

  return {
    entityMap,
    block: { key, type, depth, entityRanges, inlineStyleRanges, text },
  };
}

export function fromEditorState(editorState: EditorState): RichTextDocument {
  const raw = convertToRaw(editorState.getCurrentContent());
  const content = raw.blocks.map((block) => blockToNode(block, raw.entityMap));
  return { content, attachments: [] };
}

export function toEditorState(document: RichTextDocument): EditorState {
  return EditorState.createWithContent(
    convertFromRaw(
      document.content.reduce(
        (acc, node) => {
          if (node.t === BlockNodeType.Block) {
            const { block, entityMap } = nodeToBlock(
              node,
              Object.keys(acc.entityMap).length,
            );
            acc.blocks.push(block);
            Object.assign(acc.entityMap, entityMap);
          }
          return acc;
        },
        { blocks: [], entityMap: {} } as {
          blocks: RawDraftContentBlock[];
          entityMap: EntityMap;
        },
      ),
    ),
  );
}

export function isEmpty(document: RichTextDocument) {
  if (document.attachments.length) {
    return false;
  }

  for (const block of document.content) {
    if (block.t === BlockNodeType.Image) {
      return false;
    }

    if (block.t === BlockNodeType.Block) {
      for (const child of block.c) {
        if (child.c.length > 0) {
          return false;
        }
      }
    }
  }

  return true;
}
