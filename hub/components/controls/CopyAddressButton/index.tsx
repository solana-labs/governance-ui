import type { PublicKey } from '@solana/web3.js';

import { useToast, ToastType } from '@hub/hooks/useToast';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  address: string | PublicKey;
}

export function CopyAddressButton(props: Props) {
  const { address, ...rest } = props;
  const { publish } = useToast();

  return (
    <button
      {...rest}
      onClick={async (e) => {
        try {
          const text =
            typeof address === 'string' ? address : address.toBase58();
          await navigator.clipboard.writeText(text);
          publish({
            type: ToastType.Success,
            title: 'Copied!',
            message: 'Address copied to clipboard',
          });
        } catch {
          publish({
            type: ToastType.Error,
            title: 'Could not copy address',
            message: 'There was an error when trying to copy this address',
          });
        }

        rest.onClick?.(e);
      }}
    />
  );
}
