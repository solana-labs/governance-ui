import { DatabaseIcon } from '@heroicons/react/outline';
import { HotWalletAccount } from '@hooks/useHotWallet';
import useHotWalletPluginUXDStaking from '@hooks/useHotWalletPluginUXDStaking';
import StakingCampaign from './StakingCampaign';

const HotWalletPluginUXDStaking = ({
  hotWalletAccount,
}: {
  hotWalletAccount: HotWalletAccount;
}) => {
  const { stakingCampaignsInfo } = useHotWalletPluginUXDStaking(
    hotWalletAccount,
  );

  if (!stakingCampaignsInfo) {
    return <></>;
  }

  return (
    <div className="bg-bkg-2">
      <h3 className="bg-bkg-2 mb-4 flex items-center">
        <DatabaseIcon className="flex-shrink-0 h-5 mr-1 text-primary-light w-5" />
        UXD Staking Stats
      </h3>

      <div className="space-y-3">
        {stakingCampaignsInfo.length ? (
          stakingCampaignsInfo.map((stakingCampaignInfo) => (
            <StakingCampaign
              key={stakingCampaignInfo.pda.toBase58()}
              stakingCampaignInfo={stakingCampaignInfo}
            />
          ))
        ) : (
          <div className="text-sm text-fgd-3 bg-bkg-1 w-full p-2">
            no configured campaign
          </div>
        )}
      </div>
    </div>
  );
};

export default HotWalletPluginUXDStaking;
