import CopyIcon from '@carbon/icons-react/lib/Copy';
import WalletIcon from '@carbon/icons-react/lib/Wallet';
import type { PublicKey } from '@solana/web3.js';

import { getAccountName } from '@components/instructions/tools';
import { CopyAddressButton } from '@hub/components/controls/CopyAddressButton';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
  walletAddress: PublicKey;
}

export function WalletDescription(props: Props) {
  const name = getAccountName(props.walletAddress);
  const address = abbreviateAddress(props.walletAddress);

  return (
    <header className={cx('flex', 'items-center', props.className)}>
      <div className="flex items-center">
        <WalletIcon className="h-4 mr-2 w-4 dark:fill-white" />
        <div className="dark:text-white">{name || `Wallet ${address}`}</div>
      </div>
      <div className="flex items-center mt-1 ml-2">
        <div className="text-xs dark:text-neutral-500">{address}</div>
        <CopyAddressButton address={props.walletAddress} className="group ml-2">
          <CopyIcon className="h-3 transition-colors w-3 dark:fill-neutral-500 dark:group-hover:fill-neutral-300" />
        </CopyAddressButton>
      </div>
    </header>
  );
}
