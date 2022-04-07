import { SaberStats } from '@hooks/useSaberStats';

const SaberStat = ({
  liquidityPoolName,
  uiBalance,
  pendingRewards,
  mintName,
}: SaberStats) => {
  return (
    <div className="flex flex-col items-start bg-bkg-1 p-3">
      <span>{liquidityPoolName}</span>
      <div className="flex flex-col mt-3">
        <span className="text-xs">Balance</span>
        <span className="text-fgd-3 text-xs mt-1">{`${uiBalance.toLocaleString()} ${mintName}`}</span>
      </div>

      <div className="flex flex-col mt-2">
        <span className="text-xs">Pending Rewards</span>
        {pendingRewards.map(({ name, uiPendingAmount }) => (
          <span
            key={name}
            className="text-fgd-3 text-xs mt-1"
          >{`${uiPendingAmount.toLocaleString()} ${name}`}</span>
        ))}
      </div>
    </div>
  );
};

export default SaberStat;
