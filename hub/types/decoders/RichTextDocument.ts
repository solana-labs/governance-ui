import * as IT from 'io-ts';

import * as RTD from '../RichTextDocument';

export const InlineStyleBold = IT.literal(RTD.InlineStyle.Bold);
export const InlineStyleCode = IT.literal(RTD.InlineStyle.Code);
export const InlineStyleItalic = IT.literal(RTD.InlineStyle.Italic);
export const InlineStyleSmall = IT.literal(RTD.InlineStyle.Small);
export const InlineStyleStrikethrough = IT.literal(
  RTD.InlineStyle.Strikethrough,
);
export const InlineStyleUnderline = IT.literal(RTD.InlineStyle.Underline);

export const InlineStyle = IT.union([
  InlineStyleBold,
  InlineStyleCode,
  InlineStyleItalic,
  InlineStyleSmall,
  InlineStyleStrikethrough,
  InlineStyleUnderline,
]);

export const BlockStyleBlockquote = IT.literal(RTD.BlockStyle.Blockquote);
export const BlockStyleCodeblock = IT.literal(RTD.BlockStyle.Codeblock);
export const BlockStyleH1 = IT.literal(RTD.BlockStyle.H1);
export const BlockStyleH2 = IT.literal(RTD.BlockStyle.H2);
export const BlockStyleH3 = IT.literal(RTD.BlockStyle.H3);
export const BlockStyleH4 = IT.literal(RTD.BlockStyle.H4);
export const BlockStyleH5 = IT.literal(RTD.BlockStyle.H5);
export const BlockStyleH6 = IT.literal(RTD.BlockStyle.H6);
export const BlockStyleOL = IT.literal(RTD.BlockStyle.OL);
export const BlockStyleP = IT.literal(RTD.BlockStyle.P);
export const BlockStyleUL = IT.literal(RTD.BlockStyle.UL);

export const BlockStyle = IT.union([
  BlockStyleBlockquote,
  BlockStyleCodeblock,
  BlockStyleH1,
  BlockStyleH2,
  BlockStyleH3,
  BlockStyleH4,
  BlockStyleH5,
  BlockStyleH6,
  BlockStyleOL,
  BlockStyleP,
  BlockStyleUL,
]);

export const InlineNodeTypeAnchor = IT.literal(RTD.InlineNodeType.Anchor);
export const InlineNodeTypeInline = IT.literal(RTD.InlineNodeType.Inline);
export const InlineNodeTypePublicKey = IT.literal(RTD.InlineNodeType.PublicKey);

export const InlineNodeType = IT.union([
  InlineNodeTypeAnchor,
  InlineNodeTypeInline,
  InlineNodeTypePublicKey,
]);

export const BlockNodeTypeBlock = IT.literal(RTD.BlockNodeType.Block);
export const BlockNodeTypeImage = IT.literal(RTD.BlockNodeType.Image);
export const BlockNodeTypeTwitterEmbed = IT.literal(
  RTD.BlockNodeType.TwitterEmbed,
);

export const BlockNodeType = IT.union([
  BlockNodeTypeBlock,
  BlockNodeTypeImage,
  BlockNodeTypeTwitterEmbed,
]);

export const AttachmentTypeTwitterEmbed = IT.literal(
  RTD.AttachmentType.TwitterEmbed,
);

// export const AttachmentType = IT.union([AttachmentTypeTwitterEmbed]);
export const AttachmentType = AttachmentTypeTwitterEmbed;

export const InlineNode = IT.type({
  t: InlineNodeTypeInline,
  c: IT.string,
  s: IT.union([IT.null, IT.undefined, IT.array(InlineStyle)]),
});

export const AnchorNode = IT.type({
  t: InlineNodeTypeAnchor,
  c: IT.array(InlineNode),
  u: IT.string,
});

export const PublicKeyNode = IT.type({
  t: InlineNodeTypePublicKey,
  c: IT.string,
  k: IT.string,
  s: IT.union([IT.null, IT.undefined, IT.array(InlineStyle)]),
});

export const ImageNode = IT.type({
  t: BlockNodeTypeImage,
  c: IT.array(InlineNode),
  u: IT.string,
});

export const BlockNode = IT.type({
  t: BlockNodeTypeBlock,
  c: IT.array(IT.union([AnchorNode, InlineNode, PublicKeyNode])),
  s: BlockStyle,
});

export const TwitterEmbedNode = IT.type({
  t: BlockNodeTypeTwitterEmbed,
  c: IT.type({
    u: IT.string,
    t: IT.union([IT.null, IT.undefined, IT.string]),
    h: IT.union([IT.null, IT.undefined, IT.string]),
  }),
});

export const TwitterEmbedAttachment = IT.type({
  t: AttachmentTypeTwitterEmbed,
  c: IT.type({
    u: IT.string,
    t: IT.union([IT.null, IT.undefined, IT.string]),
    h: IT.union([IT.null, IT.undefined, IT.string]),
  }),
});

export const RichTextDocument = IT.type({
  attachments: IT.array(TwitterEmbedAttachment),
  content: IT.array(IT.union([BlockNode, ImageNode, TwitterEmbedNode])),
});
