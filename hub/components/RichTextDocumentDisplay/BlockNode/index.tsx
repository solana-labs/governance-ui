import { cloneElement } from 'react';

import cx from '@hub/lib/cx';
import {
  BlockNode as BlockNodeModel,
  BlockStyle,
  InlineNodeType,
  AnchorNode as AnchorNodeModel,
  InlineNode as InlineNodeModel,
  PublicKeyNode as PublicKeyNodeModel,
} from '@hub/types/RichTextDocument';

import { AnchorNode } from './AnchorNode';
import { InlineNode } from './InlineNode';
import { PublicKeyNode } from './PublicKeyNode';

function getTag(style: BlockStyle) {
  switch (style) {
    case BlockStyle.Blockquote:
      return (
        <blockquote className="text-current rounded bg-neutral-200 p-2 text-[1em]" />
      );
    case BlockStyle.Codeblock:
      return (
        <pre className="text-current rounded bg-neutral-200 p-2 text-[1em]" />
      );
    case BlockStyle.H1:
      return <h1 className="text-current m-0 text-[3em] leading-[1]" />;
    case BlockStyle.H2:
      return <h2 className="text-current m-0 text-[2.25em] leading-[2.5em]" />;
    case BlockStyle.H3:
      return (
        <h3 className="text-current m-0 text-[1.875em] leading-[2.25em]" />
      );
    case BlockStyle.H4:
      return <h4 className="text-current m-0 text-[1.5em] leading-[2em]" />;
    case BlockStyle.H5:
      return <h5 className="text-current m-0 text-[1.25em] leading-[1.75em]" />;
    case BlockStyle.H6:
      return (
        <h6 className="text-current m-0 text-[1.125em] leading-[1.75em]" />
      );
    case BlockStyle.OL:
      return <ol className="text-current m-0" />;
    case BlockStyle.P:
      return <p className="text-current m-0 text-[1em] leading-[inherit]" />;
    case BlockStyle.UL:
      return <ul className="text-current m-0" />;
  }
}

function doesNotEndWithEllipsis(
  node: string | AnchorNodeModel | InlineNodeModel | PublicKeyNodeModel,
): boolean {
  if (typeof node === 'string') {
    return !node.endsWith('…');
  }

  const last = node.c[node.c.length - 1];
  return doesNotEndWithEllipsis(last);
}

interface Props {
  className?: string;
  block: BlockNodeModel;
  isClipped?: boolean;
  isLast?: boolean;
  showExpand?: boolean;
  onExpand?(): void;
}

export function BlockNode(props: Props) {
  const tag = getTag(props.block.s);
  const children = props.block.c.map((child, i) => {
    switch (child.t) {
      case InlineNodeType.Anchor:
        return <AnchorNode anchor={child} key={i} />;
      case InlineNodeType.Inline:
        return <InlineNode node={child} key={i} />;
      case InlineNodeType.PublicKey:
        return <PublicKeyNode node={child} key={i} />;
    }
  });

  const lastChild = props.block.c[props.block.c.length - 1];

  if (
    props.isClipped &&
    props.isLast &&
    lastChild &&
    doesNotEndWithEllipsis(lastChild)
  ) {
    children.push(<span key="ellipsis">&#8230;</span>);
  }

  if (props.isClipped && props.isLast && props.showExpand) {
    children.push(
      <button
        key="expand"
        className={cx(
          'cursor-pointer',
          'inline-block',
          'leading-[1.75em]',
          'ml-2',
          'text-sky-500',
          'text-[1em]',
          'transition-colors',
          'hover:text-sky-400',
        )}
        onClick={(e) => {
          e.stopPropagation();
          props.onExpand?.();
        }}
      >
        View more
      </button>,
    );
  }

  return cloneElement(tag, {
    children,
    className: cx(tag.props.className, props.className),
  });
}
