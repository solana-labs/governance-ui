import { useCallback, useEffect, useState } from 'react';
import { HotWalletAccount } from './useHotWallet';
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration';
import useWalletStore from 'stores/useWalletStore';
import { PublicKey } from '@solana/web3.js';
import {
  StakingCampaign,
  getTokenAccountUiBalance,
} from '@uxdprotocol/uxd-staking-client';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';
import useSingleSideStakingClient from './useSingleSideStakingClient';

const UsersCampaigns = {
  ['AWuSjBCEMVtk8fX2HAwtuMjoHLmLM72PJxi1dZdKHPFu']: [
    // Fake Dao devnet SOL Treasury's governance
    {
      name: 'Campaign Name',
      pda: new PublicKey('Hkzqzfy9VKd5SNeMZnN1Yq49MjrjUzoXxqevFEMxQZFx'),
    },
  ],

  ['AuQHcJZhTd1dnXRrM78RomFiCvW6a9CqxxJ94Fp9h8b']: [
    // Fake Dao SOL Treasury's governance
    {
      name: 'Campaign Test',
      pda: new PublicKey('C37FJ2JeDciaEs1nKazMkkH21VZjQVq4WTMLSJYiibRr'),
    },
  ],

  ['7M6TSEkRiXiYmpRCcCDSdJGTGxAPem2HBqjW4gLQ2KoE']: [
    // Dao SOL Treasury's governance
    {
      name: 'UXP Campaign',
      pda: new PublicKey('GMkG1Xr1ZAtLbHRxfbqLFEHqjP7rGwEfhQFed41aEL1k'),
    },
  ],
};

export type StakingCampaignInfo = StakingCampaign & {
  name: string;
  pda: PublicKey;

  // Token staked on staking accounts v1
  uiStakedTokensV1: number;
  uiStakedTokensV2: number;
};

const useHotWalletPluginUXDStaking = (hotWalletAccount: HotWalletAccount) => {
  const [stakingCampaignsInfo, setStakingCampaignsInfo] = useState<
    StakingCampaignInfo[]
  >();
  const connection = useWalletStore((s) => s.connection);
  const { client: sssClient } = useSingleSideStakingClient();

  const loadUXDStakingCampaignInfo = useCallback(async () => {
    try {
      const programId =
        uxdProtocolStakingConfiguration.programId[connection.cluster];

      if (!programId) {
        return;
      }

      if (!sssClient) {
        return;
      }

      const campaigns =
        UsersCampaigns[hotWalletAccount.publicKey.toBase58()] ?? [];

      const stakingCampaigns: StakingCampaign[] = await Promise.all(
        campaigns.map(({ pda }) => sssClient.getOnChainStakingCampaign(pda)),
      );

      const uiStakedTokensStakingAccountsV1: PromiseSettledResult<number>[] = await Promise.allSettled(
        stakingCampaigns.map(({ stakedVault }) =>
          getTokenAccountUiBalance({
            connection: connection.current,
            tokenAccount: stakedVault,
          }),
        ),
      );

      setStakingCampaignsInfo(
        stakingCampaigns.map((stakingCampaign, index) => {
          const uiStakedTokensV1 = uiStakedTokensStakingAccountsV1[index];

          return {
            ...stakingCampaign,
            uiStakedTokensV1:
              uiStakedTokensV1.status === 'rejected'
                ? 0
                : uiStakedTokensV1.value,
            uiStakedTokensV2: Number(
              nativeAmountToFormattedUiAmount(
                stakingCampaign.stakedAmount,
                stakingCampaign.stakedMintDecimals,
              ),
            ),
            name: campaigns[index].name,
            pda: campaigns[index].pda,
          };
        }),
      );
    } catch (e) {
      console.log(e);
      setStakingCampaignsInfo([]);
    }
  }, [connection, hotWalletAccount, sssClient]);

  useEffect(() => {
    loadUXDStakingCampaignInfo();
  }, [loadUXDStakingCampaignInfo]);

  return { stakingCampaignsInfo };
};

export default useHotWalletPluginUXDStaking;
