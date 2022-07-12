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
        <div key={identifier} className="flex flex-col">
          <div className="flex justify-between">
            <span className="text-xs w-14 whitespace-nowrap pr-2">
              option {identifier}:
            </span>

            <span className="flex w-40 pr-2">
              <span className="text-xs whitespace-nowrap">lock time</span>
              <span className="text-xs ml-1 text-fgd-3 whitespace-nowrap">
                {lockupSecs.toNumber().toLocaleString()}s
              </span>
            </span>

            <span className="flex">
              <span className="text-xs whitespace-nowrap">apr</span>
              <span className="text-xs ml-1 text-fgd-3 whitespace-nowrap">
                {apr.toNumber() / 100}%
              </span>
            </span>
          </div>
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
          <span className="text-xs">total staked amount v1:</span>
          <span className="text-xs">
            {stakingCampaignInfo.uiStakedTokensV1
              ? `${stakingCampaignInfo.uiStakedTokensV1.toLocaleString()} ${stackedMintName}`
              : 'unknown'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-xs">total staked amount v2:</span>
          <span className="text-xs">
            {stakingCampaignInfo.uiStakedTokensV2
              ? `${stakingCampaignInfo.uiStakedTokensV2.toLocaleString()} ${stackedMintName}`
              : 'unknown'}
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
              stakingCampaignInfo.totalCurrentStakingAccounts,
            ).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex flex-col bg-bkg-1 p-2 rounded-md space-y-1 overflow-x-auto">
        {options}
      </div>
    </>
  );
};

export default StakingCampaign;
