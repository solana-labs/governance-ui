import useHotWallet from '@hooks/useHotWallet';
import { FireIcon } from '@heroicons/react/solid';
import HotWalletName from './HotWalletName';
import HotWalletPluginTribecaGauges from './plugins/TribecaGauges/TribecaGauges';
import {
  saberTribecaConfiguration,
  sunnyTribecaConfiguration,
} from '@tools/sdk/tribeca/configurations';
import HotWalletPluginTokenAccounts from './plugins/TokenAccounts/TokenAccounts';
import HotWalletPluginSaberStats from './plugins/SaberStats/SaberStats';
import HotWalletPluginUXDStaking from './plugins/UXDStaking/UXDStaking';

const HotWallet = (): JSX.Element => {
  const { hotWalletAccount } = useHotWallet();

  if (!hotWalletAccount) {
    return <></>;
  }

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <h3 className="bg-bkg-2 mb-4 flex items-center">
        <FireIcon className="flex-shrink-0 h-5 mr-1 text-primary-light w-5" />
        Hot Wallet
      </h3>

      <HotWalletName
        hotWalletAddress={hotWalletAccount.publicKey}
        hotWalletName={hotWalletAccount.name}
      />

      <div className="space-y-6 mt-6">
        <HotWalletPluginTokenAccounts hotWalletAccount={hotWalletAccount} />

        <HotWalletPluginUXDStaking hotWalletAccount={hotWalletAccount} />

        <HotWalletPluginTribecaGauges
          tribecaConfiguration={saberTribecaConfiguration}
        />

        <HotWalletPluginTribecaGauges
          tribecaConfiguration={sunnyTribecaConfiguration}
        />

        <HotWalletPluginSaberStats hotWalletAccount={hotWalletAccount} />
      </div>
    </div>
  );
};

export default HotWallet;
