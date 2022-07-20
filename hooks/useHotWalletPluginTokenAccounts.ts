import { MintInfo, u64 } from '@solana/spl-token';
import BigNumber from 'bignumber.js';
import { PublicKey } from '@solana/web3.js';
import {
  getOwnedTokenAccounts,
  TokenProgramAccount,
  tryGetMint,
} from '@utils/tokens';
import { useCallback, useEffect, useState } from 'react';
import useWalletStore from 'stores/useWalletStore';
import tokenService from '@utils/services/token';
import { BN } from '@project-serum/anchor';
import { HotWalletAccount } from './useHotWallet';
import { getSplTokenNameByMint } from '@utils/splTokens';

export type HotWalletTokenAccounts = {
  publicKey: PublicKey;
  mint: PublicKey;
  decimals: number;
  amount: u64;
  mintName?: string;
  usdMintValue: number;
  usdTotalValue: u64;
}[];

const useHotWalletPluginTokenAccounts = (
  hotWalletAccount: HotWalletAccount,
) => {
  const connection = useWalletStore((store) => store.connection);
  const [
    tokenAccounts,
    setTokenAccounts,
  ] = useState<HotWalletTokenAccounts | null>(null);

  const loadTokenAccounts = useCallback(async () => {
    if (!connection.current) return [];

    const ownedTokenAccounts = await getOwnedTokenAccounts(
      connection.current,
      hotWalletAccount.publicKey,
    );

    const tokenMintAddresses = [
      ...new Set(ownedTokenAccounts.map(({ account: { mint } }) => mint)),
    ];

    const mintInfos = (
      await Promise.all(
        tokenMintAddresses.map((tokenMintAddress) =>
          tryGetMint(connection.current, tokenMintAddress),
        ),
      )
    ).reduce(
      (acc, mintInfo, index) => {
        if (!mintInfo)
          throw new Error(
            `Cannot load mint info ${tokenMintAddresses[index].toBase58()}`,
          );

        acc[mintInfo.publicKey.toBase58()] = {
          ...mintInfo,
          name: getSplTokenNameByMint(mintInfo.publicKey),
          usdValue: tokenService.getUSDTokenPrice(
            mintInfo.publicKey.toBase58(),
          ),
        };

        return acc;
      },
      {} as {
        [key: string]: TokenProgramAccount<MintInfo> & {
          name?: string;
          usdValue: number;
        };
      },
    );

    return ownedTokenAccounts
      .map((tokenAccount) => {
        const mintInfo = mintInfos[tokenAccount.account.mint.toBase58()];

        return {
          mint: tokenAccount.account.mint,
          publicKey: tokenAccount.publicKey,
          amount: tokenAccount.account.amount,
          decimals: mintInfo.account.decimals,
          mintName: mintInfo.name,
          usdMintValue: mintInfo.usdValue,
          usdTotalValue: new BN(
            new BigNumber(tokenAccount.account.amount.toString())
              .multipliedBy(mintInfo.usdValue)
              .integerValue()
              .toString(),
          ),
        };
      })
      .sort((a, b) => (b.amount.toString() < a.amount.toString() ? -1 : 1));
  }, [
    connection,
    JSON.stringify(tokenService._tokenPriceToUSDlist),
    hotWalletAccount,
  ]);

  useEffect(() => {
    // add a cancel
    let quit = false;

    loadTokenAccounts().then((infos) => {
      if (quit) {
        return;
      }

      setTokenAccounts(infos);
    });

    return () => {
      quit = true;
    };
  }, [loadTokenAccounts]);

  return {
    tokenAccounts,
  };
};

export default useHotWalletPluginTokenAccounts;
