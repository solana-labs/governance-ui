import { BookOpenIcon } from '@heroicons/react/solid';
import { HotWalletAccount } from '@hooks/useHotWallet';
import useHotWalletPluginTokenAccounts from '@hooks/useHotWalletPluginTokenAccounts';
import TokenAccount from './TokenAccount';

const HotWalletPluginTokenAccounts = ({
  hotWalletAccount,
}: {
  hotWalletAccount: HotWalletAccount;
}) => {
  const { tokenAccounts } = useHotWalletPluginTokenAccounts(hotWalletAccount);

  if (!hotWalletAccount) {
    return <></>;
  }

  return (
    <div className="bg-bkg-2">
      <h3 className="bg-bkg-2 mb-4 flex items-center">
        <BookOpenIcon className="flex-shrink-0 h-5 mr-1 text-primary-light w-5" />
        Token Accounts ({tokenAccounts?.length})
      </h3>

      <div
        style={{ maxHeight: '150px' }}
        className="overflow-y-auto bg-bkg-1 mb-3 px-4 py-2 rounded-md"
      >
        {tokenAccounts?.map((tokenAccount) => (
          <TokenAccount
            key={tokenAccount.publicKey.toBase58()}
            info={tokenAccount}
          />
        ))}
      </div>
    </div>
  );
};

export default HotWalletPluginTokenAccounts;
