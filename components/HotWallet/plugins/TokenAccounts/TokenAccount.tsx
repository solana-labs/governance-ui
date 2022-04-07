import { abbreviateAddress } from '@utils/formatting';
import { HotWalletTokenAccounts } from '@hooks/useHotWalletPluginTokenAccounts';
import { getExplorerUrl } from '@components/explorer/tools';
import useWalletStore from 'stores/useWalletStore';
import { createRef } from 'react';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';

const TokenAccount = ({ info }: { info: HotWalletTokenAccounts[0] }) => {
  const connection = useWalletStore((store) => store.connection);

  const linkRef = createRef<HTMLAnchorElement>();

  const amountFormatted = nativeAmountToFormattedUiAmount(
    info.amount,
    info.decimals,
  );

  const usdTotalValueFormatted = info.usdTotalValue.isZero()
    ? ''
    : `$${nativeAmountToFormattedUiAmount(info.usdTotalValue, info.decimals)}`;

  return (
    <div
      className="flex flex text-fgd-1 hover:bg-bkg-3 w-full flex-wrap justify-between pt-1 pb-1 cursor-pointer"
      onClick={() => linkRef.current?.click()}
    >
      <div>
        <span className="flex content-center flex">
          <span className="text-sm">{amountFormatted}</span>
          <span className="text-fgd-3 text-xs ml-1 flex items-center">
            {info.mintName ?? abbreviateAddress(info.mint)}
          </span>
        </span>

        <span className="text-fgd-3 text-xs">{usdTotalValueFormatted}</span>
      </div>

      <a
        className="flex"
        href={getExplorerUrl(connection.endpoint, info.publicKey)}
        ref={linkRef}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs text-fgd-3 flex mt-1">
          {abbreviateAddress(info.publicKey)}
        </span>
        <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
      </a>
    </div>
  );
};

export default TokenAccount;
