import { StakingCampaignInfo } from '@hooks/useHotWalletPluginUXDStaking';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';
import { getSplTokenNameByMint } from '@utils/splTokens';

const StakingCampaign = ({
  stakingCampaignInfo,
}: {
  stakingCampaignInfo: StakingCampaignInfo;
}) => {
  const startDate = new Date(
    Number(stakingCampaignInfo.startTs) * 1_000,
  ).toUTCString();

  const endDate = stakingCampaignInfo.endTs
    ? new Date(Number(stakingCampaignInfo.endTs) * 1_000).toUTCString()
    : '-';

  const options = stakingCampaignInfo.stakingOptions.length ? (
    stakingCampaignInfo.stakingOptions
      .filter(({ identifier }) => identifier)
      .map(({ identifier, lockupSecs, apr }) => (
        <div key={identifier} className="flex items-center justify-between">
          <span className="text-xs w-1/3 flex">
            <span className="text-xs">option:</span>
            <span className="text-xs  ml-2 text-fgd-3">{identifier}</span>
          </span>

          <span className="w-1/3 flex">
            <span className="text-xs">lock time:</span>
            <span className="text-xs  ml-2 text-fgd-3">
              {lockupSecs.toNumber().toLocaleString()}s
            </span>
          </span>

          <span className="w-1/3 flex">
            <span className="text-xs">apr:</span>
            <span className="text-xs ml-2 text-fgd-3">
              {apr.toNumber() / 100}%
            </span>
          </span>
        </div>
      ))
  ) : (
    <span className="text-sm">No options</span>
  );

  const rewardMintName = getSplTokenNameByMint(stakingCampaignInfo.rewardMint);
  const stackedMintName = getSplTokenNameByMint(stakingCampaignInfo.stakedMint);

  return (
    <>
      <div className="text-sm text-bold">{stakingCampaignInfo.name}</div>

      <div className="flex flex-col bg-bkg-1 p-2 rounded-md space-y-3">
        <div className="flex justify-between">
          <span className="text-xs">starting date:</span>
          <span className="text-xs">{startDate}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-xs">end date:</span>
          <span className="text-xs">{endDate}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-xs">finalized:</span>
          <span className="text-xs">
            {stakingCampaignInfo.isFinalized ? 'yes' : 'no'}
          </span>
        </div>
      </div>

      <div className="flex flex-col bg-bkg-1 p-2 rounded-md space-y-1">
        <div className="flex justify-between">
          <span className="text-xs">total campaign rewards:</span>
          <span className="text-xs">
            {nativeAmountToFormattedUiAmount(
              stakingCampaignInfo.initialRewardAmount,
              stakingCampaignInfo.rewardMintDecimals,
            )}
            <span className="ml-1">{rewardMintName}</span>
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-xs">unallocated campaign rewards:</span>
          <span className="text-xs">
            {nativeAmountToFormattedUiAmount(
              stakingCampaignInfo.remainingRewardAmount,
              stakingCampaignInfo.rewardMintDecimals,
            )}
            <span className="ml-1">{rewardMintName}</span>
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-xs">total staked amount:</span>
          <span className="text-xs">
            {stakingCampaignInfo.stakedVaultBalance
              ? `${stakingCampaignInfo.stakedVaultBalance.toLocaleString()} ${stackedMintName}`
              : 'unknown'}
            <span className="ml-1">{rewardMintName}</span>
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-xs">total created staking accounts:</span>
          <span className="text-xs">
            {Number(
              stakingCampaignInfo.totalCreatedStakingAccounts,
            ).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-xs">total current staking accounts:</span>
          <span className="text-xs">
            {Number(
              stakingCampaignInfo.totalCreatedStakingAccounts,
            ).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex flex-col bg-bkg-1 p-2 rounded-md space-y-1">
        <div className="flex justify-between">
          <span className="text-xs">staked mint:</span>
          <span className="text-xs">
            {getSplTokenNameByMint(stakingCampaignInfo.stakedMint)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-xs">reward mint:</span>
          <span className="text-xs">{rewardMintName}</span>
        </div>
      </div>

      <div className="flex flex-col bg-bkg-1 p-2 rounded-md space-y-1">
        {options}
      </div>
    </>
  );
};

export default StakingCampaign;
