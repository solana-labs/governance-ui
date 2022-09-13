import ErrorIcon from '@carbon/icons-react/lib/Error';
import FaceSatisfiedIcon from '@carbon/icons-react/lib/FaceSatisfied';
import WarningIcon from '@carbon/icons-react/lib/Warning';
import * as Toast from '@radix-ui/react-toast';
import React, { createContext, useEffect, useState } from 'react';

import cx from '@hub/lib/cx';

export enum ToastType {
  Error,
  Success,
  Warning,
}

interface ToastModel {
  type: ToastType;
  message: string;
  title?: string;
  id: string;
}

interface Value {
  publish(alert: Omit<ToastModel, 'id'>): void;
}

export const DEFAULT: Value = {
  publish: () => {
    throw new Error('Not implemented');
  },
};

export const context = createContext(DEFAULT);

const makeId = () => Math.floor(Math.random() * 1000000000).toString();

const defaultTitle = (toast: ToastModel) => {
  switch (toast.type) {
    case ToastType.Error:
      return 'Error';
    case ToastType.Success:
      return 'Success!';
    case ToastType.Warning:
      return 'Warning';
  }
};

const icon = (toast: ToastModel) => {
  switch (toast.type) {
    case ToastType.Error:
      return <ErrorIcon className="fill-rose-500" />;
    case ToastType.Success:
      return <FaceSatisfiedIcon className="fill-emerald-500" />;
    case ToastType.Warning:
      return <WarningIcon className="fill-orange-500" />;
  }
};

function ToastItem(props: ToastModel & { onOpenChange(open: boolean): void }) {
  const iconElement = icon(props);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <Toast.Root onOpenChange={props.onOpenChange}>
      <Toast.Close
        className={cx(
          'bg-white',
          'drop-shadow-xl',
          'grid',
          'fixed',
          'items-start',
          'p-3',
          'relative',
          'rounded',
          'w-80',
          'h-0',
          'opacity-0',
          'overflow-hidden',
          'text-left',
          'translate-x-full',
          'transition-all',
          'hover:scale-105',
          show ? 'opacity-100' : 'opacity-0',
          show ? 'h-auto' : 'h-0',
          show ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center">
            {React.cloneElement(iconElement, {
              className: cx(iconElement.props.className, 'h-4', 'w-4'),
            })}
          </div>
          <Toast.Title
            className={cx('text-neutral-900', 'text-sm', 'font-bold')}
          >
            {props.title || defaultTitle(props)}
          </Toast.Title>
        </div>
        <div className="pl-6">
          <Toast.Description className="text-sm text-zinc-500">
            {props.message}
          </Toast.Description>
        </div>
      </Toast.Close>
    </Toast.Root>
  );
}

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export function ToastProvider(props: Props) {
  const [toasts, setToasts] = useState<ToastModel[]>([]);

  return (
    <Toast.Provider>
      <context.Provider
        value={{
          publish: (toast) =>
            setToasts((current) =>
              current.concat({
                ...toast,
                id: makeId(),
              }),
            ),
        }}
      >
        {props.children}
        <Toast.Viewport
          className={cx(
            props.className,
            'fixed',
            'flex-col',
            'flex',
            'items-end',
            'space-y-2',
            'top-0',
            'w-full',
            'z-50',
          )}
        />
        {toasts.map((toast) => (
          <ToastItem
            {...toast}
            key={toast.id}
            onOpenChange={(open) =>
              setToasts((current) => {
                if (open && !current.map((c) => c.id).includes(toast.id)) {
                  return current.concat(toast);
                } else if (!open) {
                  return current.filter((c) => c.id !== toast.id);
                } else {
                  return current;
                }
              })
            }
          />
        ))}
      </context.Provider>
    </Toast.Provider>
  );
}
