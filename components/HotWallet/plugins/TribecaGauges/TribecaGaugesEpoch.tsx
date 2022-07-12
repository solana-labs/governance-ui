import { BN } from '@project-serum/anchor';
import { useEffect, useState } from 'react';

const ONE_DAY_IN_SEC = 3600 * 24;
const ONE_HOUR_IN_SEC = 3600;
const ONE_MIN_IN_SEC = 60;

function formatNbSec(nbSec: BN) {
  const nbDay = nbSec.div(new BN(ONE_DAY_IN_SEC));
  nbSec = nbSec.sub(nbDay.mul(new BN(ONE_DAY_IN_SEC)));

  const nbHour = nbSec.div(new BN(ONE_HOUR_IN_SEC));
  nbSec = nbSec.sub(nbHour.mul(new BN(ONE_HOUR_IN_SEC)));

  const nbMin = nbSec.div(new BN(ONE_MIN_IN_SEC));
  nbSec = nbSec.sub(nbMin.mul(new BN(ONE_MIN_IN_SEC)));

  return `${nbDay} days ${nbHour} hours ${nbMin} minutes ${nbSec} seconds`;
}

const TribecaGaugesEpoch = ({
  nextEpoch,
  rewardsEpoch,
  epochDurationSeconds,
}: {
  nextEpoch?: BN;
  rewardsEpoch?: number;
  epochDurationSeconds?: number;
}) => {
  const [time, setTime] = useState<string>('-');
  const [formattedEpochDuration, setEpochDuration] = useState<string>('-');

  useEffect(() => {
    if (!nextEpoch) {
      setTime('-');
      return;
    }

    const descriptor = setInterval(() => {
      setTime(
        formatNbSec(nextEpoch.sub(new BN(Date.now()).div(new BN(1_000)))),
      );
    }, 500);

    return () => {
      clearInterval(descriptor);
    };
  }, [nextEpoch]);

  useEffect(() => {
    setEpochDuration(
      epochDurationSeconds ? formatNbSec(new BN(epochDurationSeconds)) : '-',
    );
  }, [epochDurationSeconds]);

  return (
    <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full relative">
      <p className="text-fgd-3 text-xs">Current Epoch</p>
      <h3 className="mb-0 text-sm">{rewardsEpoch}</h3>

      <p className="text-fgd-3 text-xs mt-3">Epoch Duration</p>
      <h3 className="mb-0 text-sm">{formattedEpochDuration}</h3>

      <p className="text-fgd-3 text-xs mt-3">Next Epoch</p>
      <h3 className="mb-0 text-sm">{time}</h3>
    </div>
  );
};

export default TribecaGaugesEpoch;
