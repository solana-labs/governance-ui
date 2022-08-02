import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import {
  SolanaAugmentedProvider,
  SolanaProvider,
  SignerWallet,
} from '@saberhq/solana-contrib';
import useWalletStore from 'stores/useWalletStore';
import {
  findMinerAddress,
  findQuarryAddress,
  QuarrySDK,
} from '@quarryprotocol/quarry-sdk';

import QuarryMineConfiguration, {
  SABER_UXD_USDC_LP,
} from '@tools/sdk/quarryMine/configuration';

import { tryGetMint } from '@utils/tokens';
import { BN } from '@project-serum/anchor';
import BigNumber from 'bignumber.js';
import { getSplTokenNameByMint } from '@utils/splTokens';
import { HotWalletAccount } from './useHotWallet';

export type SaberStats = {
  liquidityPoolName: string;
  balance: BN;
  uiBalance: number;
  pendingRewards: {
    mint: PublicKey;
    name: string;
    uiPendingAmount: number;
  }[];
  mintName: string;
  rewardsTokenMintName: string;
};

const useSaberStats = (hotWalletAccount: HotWalletAccount) => {
  const connection = useWalletStore((store) => store.connection);
  const wallet = useWalletStore((s) => s.current);

  const [saberStats, setSaberStats] = useState<SaberStats[] | null>(null);

  const loadInfo = useCallback(async () => {
    if (!connection.current || !hotWalletAccount) return [];

    try {
      const {
        mint,
        rewarder,
        mintName,
        rewardsTokenMintName,
      } = QuarryMineConfiguration.mintSpecificAddresses[SABER_UXD_USDC_LP];

      const [quarry] = await findQuarryAddress(rewarder, mint);
      const [miner] = await findMinerAddress(
        quarry,
        hotWalletAccount.publicKey,
      );

      const sdk = QuarrySDK.load({
        provider: new SolanaAugmentedProvider(
          SolanaProvider.load({
            connection: connection.current,
            sendConnection: connection.current,
            wallet: (wallet as unknown) as SignerWallet,
          }),
        ),
      });

      const sonarData = await fetch(
        'https://api-uxd.sonar.watch/uxd',
      ).then((res) => res.json());
      const saberAccountSonarData = sonarData.find(
        ({ platform, owner }) =>
          platform === 'quarry' &&
          owner === hotWalletAccount.publicKey.toBase58(),
      );

      const pendingRewards = saberAccountSonarData.rewardAssets.map(
        (asset) => ({
          mint: new PublicKey(asset.mint),
          name: getSplTokenNameByMint(new PublicKey(asset.mint)),
          uiPendingAmount: asset.pending,
        }),
      );

      const minerData = await sdk.programs.Mine.account.miner.fetch(miner);

      const lpMintInfo = await tryGetMint(connection.current, mint);
      if (!lpMintInfo)
        throw new Error(`Cannot load lp mint info for ${mint.toBase58()}`);

      return [
        {
          liquidityPoolName: 'Saber UXD-USDC Liquidity Pool',
          balance: minerData.balance,
          uiBalance: new BigNumber(minerData.balance.toString())
            .shiftedBy(-lpMintInfo.account.decimals)
            .toNumber(),
          pendingRewards,
          mintName,
          rewardsTokenMintName,
        },
      ];
    } catch (err) {
      console.error('error loading saber stats', err);
      return [];
    }
  }, [connection, hotWalletAccount, wallet]);

  useEffect(() => {
    // add a cancel
    let quit = false;

    loadInfo().then((infos) => {
      if (quit) {
        return;
      }

      setSaberStats(infos);
    });

    return () => {
      quit = true;
    };
  }, [loadInfo]);

  return {
    saberStats,
  };
};

export default useSaberStats;
