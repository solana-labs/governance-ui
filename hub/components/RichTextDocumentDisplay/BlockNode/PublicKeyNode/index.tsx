import Checkmark from '@carbon/icons-react/lib/Checkmark';
import Copy from '@carbon/icons-react/lib/Copy';
import { useEffect, useState, useRef } from 'react';

import { getStyle } from '../InlineNode';
import { useToast, ToastType } from '@hub/hooks/useToast';
import cx from '@hub/lib/cx';
import { PublicKeyNode as PublicKeyNodeModel } from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  node: PublicKeyNodeModel;
}

export function PublicKeyNode(props: Props) {
  const { publish } = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (copied && typeof window !== 'undefined') {
      timer.current = window.setTimeout(() => {
        setCopied(false);
      }, 1000);
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [copied]);

  return (
    <button
      className={cx(
        props.className,
        props.node.s && props.node.s.map(getStyle).join(' '),
        'px-1',
        'align-baseline',
        'bg-black/5',
        'cursor-pointer',
        'group',
        'inline-flex',
        'items-center',
        'relative',
        'rounded',
        'space-x-1',
        'tracking-normal',
      )}
      onClick={(e) => {
        e.stopPropagation();

        try {
          navigator.clipboard.writeText(props.node.k);
          setCopied(true);
        } catch (e) {
          publish({
            type: ToastType.Error,
            title: 'Could not copy address',
            message: String(e),
          });
        }
      }}
    >
      <div
        className={cx(
          'text-[1em]',
          'transition-opacity',
          copied && 'opacity-0',
        )}
      >
        {props.node.c}
      </div>
      <Copy
        className={cx(
          'fill-neutral-500',
          'h-[1em]',
          'transition-all',
          'w-[1em]',
          'group-hover:fill-current',
          copied && 'opacity-0',
        )}
      />
      <div
        className={cx(
          'absolute',
          'bottom-0',
          'flex',
          'items-center',
          'justify-center',
          'left-0',
          'opacity-0',
          'right-0',
          'text-[0.75em]',
          'top-0',
          'transition-opacity',
          copied && 'opacity-100',
        )}
      >
        <div className="text-emerald-500">Copied!</div>
        <Checkmark className="ml-1.5 h-[1em] w-[1em] fill-emerald-500" />
      </div>
    </button>
  );
}
