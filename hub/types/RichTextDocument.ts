export enum InlineStyle {
  Bold = 'B',
  Code = 'C',
  Italic = 'I',
  Small = 'SM',
  Strikethrough = 'S',
  Underline = 'U',
}

export enum BlockStyle {
  Blockquote = 'BQ',
  Codeblock = 'CB',
  H1 = 'H1',
  H2 = 'H2',
  H3 = 'H3',
  H4 = 'H4',
  H5 = 'H5',
  H6 = 'H6',
  OL = 'OL',
  P = 'P',
  UL = 'UL',
}

export enum InlineNodeType {
  Anchor = 'A',
  Inline = 'I',
}

export enum BlockNodeType {
  Block = 'B',
  Image = 'IM',
}

export interface InlineNode {
  t: InlineNodeType.Inline;
  c: string;
  s?: null | InlineStyle[];
}

export interface AnchorNode {
  t: InlineNodeType.Anchor;
  c: InlineNode[];
  u: string;
}

export interface ImageNode {
  t: BlockNodeType.Image;
  c: InlineNode[];
  u: string;
}

export interface BlockNode {
  t: BlockNodeType.Block;
  c: (AnchorNode | InlineNode)[];
  s: BlockStyle;
}

export interface RichTextDocument {
  attachments: unknown[];
  content: (BlockNode | ImageNode)[];
}
