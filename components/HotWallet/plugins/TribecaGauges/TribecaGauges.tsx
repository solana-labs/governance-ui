import { AdjustmentsIcon } from '@heroicons/react/solid';
import useTribecaGaugeInfos from '@hooks/useTribecaGaugesInfos';
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration';
import ActiveGaugeVotes from './ActiveGaugeVotes';
import EpochGaugeVoterData from './EpochGaugeVoterData';
import EscrowData from './EscrowData';
import TribecaGaugesEpoch from './TribecaGaugesEpoch';

const HotWalletPluginTribecaGauges = ({
  tribecaConfiguration,
}: {
  tribecaConfiguration: ATribecaConfiguration;
}) => {
  const { infos, escrowOwner } = useTribecaGaugeInfos(tribecaConfiguration);

  if (!escrowOwner) {
    return <></>;
  }

  return (
    <div className="bg-bkg-2">
      <h3 className="bg-bkg-2 mb-4 flex items-center">
        <AdjustmentsIcon className="flex-shrink-0 h-5 mr-1 text-primary-light w-5" />
        {tribecaConfiguration.name} Tribeca Gauges
      </h3>

      <EscrowData escrowData={infos?.escrowData} />

      <TribecaGaugesEpoch
        nextEpoch={infos?.gaugemeisterData.nextEpochStartsAt}
        rewardsEpoch={infos?.gaugemeisterData.currentRewardsEpoch}
        epochDurationSeconds={infos?.gaugemeisterData.epochDurationSeconds}
      />

      <ActiveGaugeVotes activeGaugeVotesData={infos?.activeGaugeVotesData} />

      <EpochGaugeVoterData
        title="Current epoch"
        epochGaugeVoterData={infos?.currentEpochGaugeVoterData}
      />

      <EpochGaugeVoterData
        title="Next epoch"
        epochGaugeVoterData={infos?.nextEpochGaugeVoterData}
      />
    </div>
  );
};

export default HotWalletPluginTribecaGauges;
