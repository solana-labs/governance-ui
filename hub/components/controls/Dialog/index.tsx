import CloseIcon from '@carbon/icons-react/lib/Close';
import * as _Dialog from '@radix-ui/react-dialog';
import { forwardRef } from 'react';

import cx from '@hub/lib/cx';

export const Portal = _Dialog.Portal;
export const Root = _Dialog.Root;
export const Trigger = _Dialog.Trigger;

export const Close = forwardRef<HTMLButtonElement, _Dialog.DialogCloseProps>(
  function Close(props, ref) {
    return (
      <_Dialog.Close
        {...props}
        className={cx('absolute', 'top-4', 'right-4', props.className)}
        ref={ref}
      >
        <CloseIcon className="h-6 w-6 fill-neutral-500" />
      </_Dialog.Close>
    );
  },
);

export const Content = forwardRef<HTMLDivElement, _Dialog.DialogContentProps>(
  function Content(props, ref) {
    return (
      <_Dialog.Content
        {...props}
        className={cx(
          'bg-white',
          'drop-shadow-xl',
          'relative',
          'rounded',
          props.className,
        )}
        ref={ref}
      />
    );
  },
);

export const Description = forwardRef<
  HTMLParagraphElement,
  _Dialog.DialogDescriptionProps
>(function Description(props, ref) {
  return (
    <_Dialog.Description
      {...props}
      className={cx('px-4', 'overflow-y-auto', props.className)}
      ref={ref}
    />
  );
});

export const Overlay = forwardRef<HTMLDivElement, _Dialog.DialogOverlayProps>(
  function Overlay(props, ref) {
    return (
      <_Dialog.Overlay
        {...props}
        className={cx(
          'backdrop-blur-sm',
          'bg-black/10',
          'bottom-0',
          'fixed',
          'flex',
          'items-center',
          'justify-center',
          'left-0',
          'right-0',
          'top-0',
          'z-40',
          props.className,
        )}
        ref={ref}
      />
    );
  },
);

export const Title = forwardRef<HTMLHeadingElement, _Dialog.DialogTitleProps>(
  function Title(props, ref) {
    return (
      <_Dialog.Title
        {...props}
        className={cx(
          'font-normal',
          'mb-0',
          'mt-3',
          'text-base',
          'text-center',
          'text-neutral-900',
          props.className,
        )}
        ref={ref}
      />
    );
  },
);
