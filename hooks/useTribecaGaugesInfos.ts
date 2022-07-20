import { useCallback, useEffect, useState } from 'react';
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration';
import useTribecaGauge from './useTribecaGauge';
import { PublicKey } from '@solana/web3.js';
import useRealm from './useRealm';
import {
  EpochGaugeVoterData,
  EscrowData,
  GaugemeisterData,
  GaugeVoterData,
} from '@tools/sdk/tribeca/programs';

const EscrowOwnerMap = {
  UXDProtocol: {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('7M6TSEkRiXiYmpRCcCDSdJGTGxAPem2HBqjW4gLQ2KoE'),
  },
  'Kek World': {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('AuQHcJZhTd1dnXRrM78RomFiCvW6a9CqxxJ94Fp9h8b'),
  },
};

export type ActiveGaugeVoteData = {
  name: string;
  mint: PublicKey;
  logoURI?: string;
  weight: number;
  weightPercentage: number;
};

export type TribecaGaugesInfos = {
  escrowData: EscrowData;
  gaugemeisterData: GaugemeisterData;
  gaugeVoterData: GaugeVoterData | null;
  activeGaugeVotesData: ActiveGaugeVoteData[] | null;
  currentEpochGaugeVoterData: EpochGaugeVoterData | null;
  nextEpochGaugeVoterData: EpochGaugeVoterData | null;
};

export default function useTribecaGaugeInfos(
  tribecaConfiguration: ATribecaConfiguration | null,
) {
  const { realm } = useRealm();

  const [escrowOwner, setEscrowOwner] = useState<{
    name: string;
    publicKey: PublicKey;
  } | null>(null);

  useEffect(() => {
    if (!realm) return;

    setEscrowOwner(EscrowOwnerMap[realm.account.name] ?? null);
  }, [realm]);

  const { programs, gauges } = useTribecaGauge(tribecaConfiguration);

  const [infos, setInfos] = useState<TribecaGaugesInfos | null>(null);

  const loadInfos = useCallback(async (): Promise<TribecaGaugesInfos | null> => {
    if (!tribecaConfiguration || !programs || !escrowOwner || !gauges)
      return null;

    try {
      const [escrow] = await tribecaConfiguration.findEscrowAddress(
        escrowOwner.publicKey,
      );

      const [escrowData, gaugemeisterData] = await Promise.all([
        programs.LockedVoter.account.escrow.fetch(escrow),

        programs.Gauge.account.gaugemeister.fetch(
          tribecaConfiguration.gaugemeister,
        ),
      ]);

      let gaugeVoter: PublicKey;

      try {
        const [publicKey] = await tribecaConfiguration.findGaugeVoterAddress(
          escrow,
        );

        gaugeVoter = publicKey;
      } catch (_) {
        // means we have no gaugeVoter
        return {
          escrowData,
          gaugemeisterData,
          gaugeVoterData: null,
          activeGaugeVotesData: null,
          currentEpochGaugeVoterData: null,
          nextEpochGaugeVoterData: null,
        };
      }

      let gaugeVoterData: GaugeVoterData;

      try {
        gaugeVoterData = await programs.Gauge.account.gaugeVoter.fetch(
          gaugeVoter,
        );
      } catch (_) {
        // Gauge voter has not been initialized
        return {
          escrowData,
          gaugemeisterData,
          gaugeVoterData: null,
          activeGaugeVotesData: null,
          currentEpochGaugeVoterData: null,
          nextEpochGaugeVoterData: null,
        };
      }

      const gaugeVotes = await programs.Gauge.account.gaugeVote.all();

      const activeGaugeVotes = gaugeVotes.filter(
        (gaugeVote) =>
          gaugeVote.account.weight > 0 &&
          gaugeVote.account.gaugeVoter.equals(gaugeVoter),
      );

      const totalRelativeGaugeVotesWeight = activeGaugeVotes.reduce(
        (totalWeight, activeGaugeVote) =>
          totalWeight + activeGaugeVote.account.weight,
        0,
      );

      const activeGaugeVotesData = activeGaugeVotes.map((activeGaugeVote) => {
        const [name, gaugeInfos] = Object.entries(gauges).find(([, gauge]) =>
          gauge.publicKey.equals(activeGaugeVote.account.gauge),
        )!;

        return {
          name,
          mint: gaugeInfos.mint,
          logoURI: gaugeInfos.logoURI,
          weight: activeGaugeVote.account.weight,
          weightPercentage: Number(
            (
              (activeGaugeVote.account.weight * 100) /
              totalRelativeGaugeVotesWeight
            ).toFixed(2),
          ),
        };
      });

      let currentEpochGaugeVoterData: EpochGaugeVoterData | null = null;

      try {
        const [
          currentEpochGaugeVoter,
        ] = await tribecaConfiguration.findEpochGaugeVoterAddress(
          gaugeVoter,
          gaugemeisterData.currentRewardsEpoch,
        );

        currentEpochGaugeVoterData = await programs.Gauge.account.epochGaugeVoter.fetch(
          currentEpochGaugeVoter,
        );
      } catch (_) {
        // ignore error, means we have not voted on the epoch
      }

      let nextEpochGaugeVoterData: EpochGaugeVoterData | null = null;

      try {
        const [
          nextEpochGaugeVoter,
        ] = await tribecaConfiguration.findEpochGaugeVoterAddress(
          gaugeVoter,
          gaugemeisterData.currentRewardsEpoch + 1,
        );

        nextEpochGaugeVoterData = await programs.Gauge.account.epochGaugeVoter.fetch(
          nextEpochGaugeVoter,
        );
      } catch (_) {
        // ignore error, means we have not voted on the epoch
      }

      return {
        escrowData,
        gaugemeisterData,
        gaugeVoterData,
        activeGaugeVotesData,
        currentEpochGaugeVoterData,
        nextEpochGaugeVoterData,
      };
    } catch (err) {
      console.error(
        `Cannot load Gauges infos for escrowOwner ${
          escrowOwner.name
        } / ${escrowOwner.publicKey.toString()}`,
        err,
      );

      return null;
    }
  }, [tribecaConfiguration, programs, escrowOwner, gauges]);

  useEffect(() => {
    // add a cancel
    let quit = false;

    loadInfos().then((infos) => {
      if (quit) {
        return;
      }

      setInfos(infos);
    });

    return () => {
      quit = true;
    };
  }, [loadInfos]);

  return {
    escrowOwner,
    infos,
    gauges,
    programs,
  };
}
