import useSaberStats from '@hooks/useSaberStats';
import { SupportIcon } from '@heroicons/react/outline';
import SaberStat from './SaberStat';
import { HotWalletAccount } from '@hooks/useHotWallet';

const HotWalletPluginSaberStats = ({
  hotWalletAccount,
}: {
  hotWalletAccount: HotWalletAccount;
}) => {
  const { saberStats } = useSaberStats(hotWalletAccount);

  if (!saberStats) {
    return <></>;
  }

  return (
    <div className="bg-bkg-2">
      <h3 className="bg-bkg-2 mb-4 flex items-center">
        <SupportIcon className="flex-shrink-0 h-5 mr-1 text-primary-light w-5" />
        Saber Stats
      </h3>

      <div style={{ maxHeight: '350px' }} className="overflow-y-auto space-y-3">
        {saberStats.map((saberStat) => (
          <SaberStat key={saberStat.liquidityPoolName} {...saberStat} />
        ))}
      </div>
    </div>
  );
};

export default HotWalletPluginSaberStats;
