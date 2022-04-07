import type { EpochGaugeVoterData } from '@tools/sdk/tribeca/programs';

const EpochGaugeVoterDataBloc = ({
  title,
  epochGaugeVoterData,
}: {
  title: string;
  epochGaugeVoterData?: EpochGaugeVoterData | null;
}) => {
  return (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full relative">
      <p className="text-fgd-1 text-sm underline mb-3">{title}</p>

      {epochGaugeVoterData ? (
        <div className="flex flex-col">
          <span className="flex flex-col">
            <span className="text-fgd-3 text-xs">Voting Power</span>{' '}
            <span className="text-sm">
              {epochGaugeVoterData.votingPower.toNumber().toLocaleString()}
            </span>
          </span>

          <span className="flex flex-col">
            <span className="text-fgd-3 text-xs mt-3">Allocated Power</span>{' '}
            <span className="text-sm">
              {epochGaugeVoterData.allocatedPower.toNumber().toLocaleString()}
            </span>
          </span>
        </div>
      ) : (
        <div className="mt-3">Non-initialized epoch</div>
      )}
    </div>
  );
};

export default EpochGaugeVoterDataBloc;
