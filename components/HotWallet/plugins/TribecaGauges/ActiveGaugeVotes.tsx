import { ActiveGaugeVoteData } from '@hooks/useTribecaGaugesInfos';

const ActiveGaugeVotes = ({
  activeGaugeVotesData,
}: {
  activeGaugeVotesData?: ActiveGaugeVoteData[] | null;
}) => {
  return (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full relative">
      <p className="text-fgd-1 text-sm underline mb-3">Vote Weight</p>

      {activeGaugeVotesData && activeGaugeVotesData.length > 0 ? (
        activeGaugeVotesData.map(
          ({ name, logoURI, weight, weightPercentage }) => (
            <div
              key={name}
              className="flex fl-col align-center justify-around align-center p-3 pt-5"
            >
              {logoURI && <img className="w-5 h-5" src={logoURI} />}

              <span>{name}</span>

              <span>
                {weight}{' '}
                <span className="text-fgd-3">({weightPercentage}%)</span>
              </span>
            </div>
          ),
        )
      ) : (
        <div>No weight repartition</div>
      )}
    </div>
  );
};

export default ActiveGaugeVotes;
