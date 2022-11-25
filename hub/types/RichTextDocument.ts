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
  PublicKey = 'PK',
}

export enum BlockNodeType {
  Block = 'B',
  Image = 'IM',
  TwitterEmbed = 'TWE',
}

export enum AttachmentType {
  TwitterEmbed = 'TWE',
}

export interface InlineNode {
  t: InlineNodeType.Inline;
  c: string;
  s?: null | InlineStyle[];
}

export interface AnchorNode {
  t: InlineNodeType.Anchor;
  c: (InlineNode | PublicKeyNode)[];
  u: string;
}

export interface PublicKeyNode {
  t: InlineNodeType.PublicKey;
  c: string;
  k: string;
  s?: null | InlineStyle[];
}

export interface ImageNode {
  t: BlockNodeType.Image;
  c: InlineNode[];
  u: string;
}

export interface BlockNode {
  t: BlockNodeType.Block;
  c: (AnchorNode | InlineNode | PublicKeyNode)[];
  s: BlockStyle;
}

export interface TwitterEmbedNode {
  t: BlockNodeType.TwitterEmbed;
  c: {
    u: string;
    t?: null | string;
    h?: null | string;
  };
}

export interface TwitterEmbedAttachment {
  t: AttachmentType.TwitterEmbed;
  c: {
    u: string;
    t?: null | string;
    h?: null | string;
  };
}

export interface RichTextDocument {
  attachments: TwitterEmbedAttachment[];
  content: (BlockNode | ImageNode | TwitterEmbedNode)[];
}
