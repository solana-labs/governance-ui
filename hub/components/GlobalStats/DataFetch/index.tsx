import { WSOL_MINT_PK } from '@components/instructions/tools';
import * as Progress from '@radix-ui/react-progress';
import {
  getRealms,
  getAllGovernances,
  getNativeTreasuryAddress,
} from '@solana/spl-governance';
import { AccountInfo } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { HOLAPLEX_GRAPQL_URL_MAINNET } from '@tools/constants';
import { getRealmConfigAccountOrDefault } from '@tools/governance/configs';
import group from '@utils/group';
import { pause } from '@utils/pause';
import tokenPriceService from '@utils/services/tokenPrice';
import {
  TokenProgramAccount,
  getOwnedTokenAccounts,
  tryGetMint,
} from '@utils/tokens';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import { differenceInMinutes, minutesToMilliseconds } from 'date-fns';
import { gql, request } from 'graphql-request';
import { getAllSplGovernanceProgramIds } from 'pages/api/tools/realms';
import { useEffect, useState } from 'react';

import type { Logger } from '../Logs';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';

const getGovernancesQuery = gql`
  query($realm: PublicKey!) {
    governances(realms: [$realm]) {
      address
    }
  }
`;

async function getGovernances(
  connnection: Connection,
  logger: Logger,
  programId: PublicKey,
  realm: PublicKey,
): Promise<PublicKey[]> {
  try {
    const resp = await request(
      HOLAPLEX_GRAPQL_URL_MAINNET,
      getGovernancesQuery,
      { realm },
    );

    if (!resp.governances || resp.governances.length === 0) {
      logger.warn(
        `Could not find any governances for ${realm.toBase58()} using Holaplex. Will double check using the RPC`,
      );
      throw new Error();
    }

    return resp.governances.map((g: any) => new PublicKey(g.address));
  } catch (e) {
    logger.error(
      `Failed to fetch governances for ${realm.toBase58()} using Holaplex, will try using RPC`,
    );
  }

  const governances = await getAllGovernances(connnection, programId, realm);
  return governances.map((g) => g.pubkey);
}

interface CachedTokenAccounts {
  time: number;
  value: TokenProgramAccount<AccountInfo>[];
}

const tokenAmounts = new Map<string, CachedTokenAccounts>();

async function getTokenAmount(connection: Connection, publicKey: PublicKey) {
  const cached = tokenAmounts.get(publicKey.toBase58());

  if (cached) {
    const now = Date.now();
    const timePassed = Math.abs(differenceInMinutes(cached.time, now));

    if (timePassed < minutesToMilliseconds(10)) {
      return cached.value;
    }
  }

  const value = await getOwnedTokenAccounts(connection, publicKey);
  tokenAmounts.set(publicKey.toBase58(), { value, time: Date.now() });
  return value;
}

interface Update {
  progress: number;
  text: string;
  title: string;
}

async function fetchData(
  connection: Connection,
  logger: Logger,
  cbs: {
    onComplete?(): void;
    onNFTRealms?(realms: PublicKey[]): void;
    onNFTRealmsComplete?(realms: PublicKey[]): void;
    onRealmsComplete?(realms: PublicKey[]): void;
    onTVLComplete?(value: number): void;
    onUpdate?(update: Update): void;
  },
) {
  const tokenAmountMap = new Map<string, BigNumber>();

  const updateTokenAmount = (mintPk: PublicKey, amount: BN) => {
    const mintKey = mintPk.toBase58();
    tokenAmountMap.set(
      mintKey,
      (tokenAmountMap.get(mintKey) ?? new BigNumber(0)).plus(
        new BigNumber(amount.toString()),
      ),
    );
  };

  cbs.onUpdate?.({
    progress: 1,
    text: 'Fetching spl-gov instances...',
    title: 'Getting a list of Realms',
  });

  const allProgramIds = getAllSplGovernanceProgramIds();
  logger.log(`spl-gov instance count: ${allProgramIds.length}`);

  cbs.onUpdate?.({
    progress: 3,
    text: 'Fetching all realm instances...',
    title: 'Getting a list of Realms',
  });

  let allRealms: {
    name: string;
    publicKey: PublicKey;
    programId: PublicKey;
  }[] = [];

  for (const programId of allProgramIds) {
    try {
      const resp = await getRealms(connection, new PublicKey(programId));
      allRealms = allRealms.concat(
        resp.map((realm) => ({
          name: realm.account.name,
          publicKey: realm.pubkey,
          programId: realm.owner,
        })),
      );
    } catch (e) {
      logger.error('Failure encountered when fetching realms:');
      logger.error(String(e));
    }
  }

  // allRealms = allRealms.slice(0, 100);

  cbs.onRealmsComplete?.(allRealms.map((r) => r.publicKey));

  const nftRealms: PublicKey[] = [];

  for (const [idx, realm] of allRealms.entries()) {
    cbs.onUpdate?.({
      progress: 5 + 70 * (idx / allRealms.length),
      text: `Fetching "${realm.name}" wallets and tokens...`,
      title: 'Getting Realm details',
    });

    const realmConfig = await getRealmConfigAccountOrDefault(
      connection,
      realm.programId,
      realm.publicKey,
    );

    // Get NFT DAOs
    if (
      realmConfig.account.communityTokenConfig.voterWeightAddin?.equals(
        new PublicKey('GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw'),
      )
    ) {
      nftRealms.push(realm.publicKey);
      cbs.onNFTRealms?.(nftRealms);
    }

    // Get Governances
    const governanceAddrs: PublicKey[] = await getGovernances(
      connection,
      logger,
      realm.programId,
      realm.publicKey,
    );

    for (const governanceAddress of governanceAddrs) {
      // Check governance owned token accounts
      try {
        const tokenAccounts = await getTokenAmount(
          connection,
          governanceAddress,
        );
        for (const tokenAccount of tokenAccounts.filter(
          (ta) => !ta.account.amount.isZero(),
        )) {
          updateTokenAmount(
            tokenAccount.account.mint,
            tokenAccount.account.amount,
          );
        }
      } catch (e) {
        logger.error('Error fetching token accounts:');
        logger.error(String(e));
      }

      // Check SOL wallet owned token accounts
      try {
        const solWalletPk = await getNativeTreasuryAddress(
          realm.programId,
          governanceAddress,
        );

        const solWallet = await connection.getAccountInfo(solWalletPk);

        if (solWallet) {
          if (solWallet.lamports > 0) {
            updateTokenAmount(WSOL_MINT_PK, new BN(solWallet.lamports));
          }

          const tokenAccounts = await getTokenAmount(connection, solWalletPk);
          for (const tokenAccount of tokenAccounts.filter(
            (ta) => !ta.account.amount.isZero(),
          )) {
            updateTokenAmount(
              tokenAccount.account.mint,
              tokenAccount.account.amount,
            );
          }
        }
      } catch (e) {
        logger.error('Error fetching sol accounts:');
        logger.error(String(e));
      }
    }
  }

  cbs.onNFTRealms?.(nftRealms);
  cbs.onNFTRealmsComplete?.(nftRealms);
  cbs.onUpdate?.({
    progress: 75,
    text: 'Fetching token prices...',
    title: 'Calculating account values',
  });

  logger.log('fetching tokens and prices...');
  logger.log(`token count: ${tokenAmountMap.size}`);

  await tokenPriceService.fetchSolanaTokenList();

  const tokenGroups = group(Array.from(tokenAmountMap.keys()), 50);

  for (const [idx, tokenGroup] of tokenGroups.entries()) {
    cbs.onUpdate?.({
      progress: 75 + 20 * (idx / tokenGroups.length),
      text: `Fetching token prices (${idx + 1}/${tokenGroups.length})...`,
      title: 'Calculating account values',
    });

    await tokenPriceService.fetchTokenPrices(tokenGroup);
    await pause(1000);
  }

  let totalUsdAmount = 0;

  cbs.onUpdate?.({
    progress: 95,
    text: 'Computing total value...',
    title: 'Calculating account values',
  });

  for (const [mintPk, amount] of tokenAmountMap.entries()) {
    const tokenUsdPrice = tokenPriceService.getUSDTokenPrice(mintPk);
    if (tokenUsdPrice > 0) {
      const mint = await tryGetMint(connection, new PublicKey(mintPk));
      const decimalAmount = amount.shiftedBy(-(mint?.account.decimals || 0));
      const usdAmount = decimalAmount.toNumber() * tokenUsdPrice;
      totalUsdAmount += usdAmount;
    }
  }

  cbs.onTVLComplete?.(totalUsdAmount);
  cbs.onUpdate?.({
    progress: 100,
    text: '',
    title: 'Complete!',
  });
  cbs.onComplete?.();
}

interface Props {
  className?: string;
  connection: Connection;
  logger: Logger;
  runCount: number;
  onComplete?(): void;
  onRealmsComplete?(realms: PublicKey[]): void;
  onNFTRealms?(realms: PublicKey[]): void;
  onNFTRealmsComplete?(realm: PublicKey[]): void;
  onTVLComplete?(amount: number): void;
}

export function DataFetch(props: Props) {
  const [progress, setProgress] = useState<Update>({
    progress: 0,
    text: '',
    title: 'Ready',
  });

  useEffect(() => {
    if (props.runCount) {
      fetchData(props.connection, props.logger, {
        onNFTRealms: props.onNFTRealms,
        onNFTRealmsComplete: props.onNFTRealmsComplete,
        onRealmsComplete: props.onRealmsComplete,
        onTVLComplete: props.onTVLComplete,
        onUpdate: setProgress,
      });
    }
  }, [props.runCount]);

  return (
    <div className={props.className} key={props.runCount}>
      <div className="text-2xl text-neutral-900 mb-1">{progress.title}</div>
      {progress.progress < 100 && (
        <Progress.Root
          className="h-10 rounded overflow-hidden w-full bg-neutral-200 relative"
          value={progress.progress}
        >
          <Progress.Indicator
            className={cx(
              'absolute',
              'animate-move-stripes',
              'duration-700',
              'top-0',
              'bottom-0',
              'transition-all',
              'w-full',
            )}
            style={{
              background:
                'repeating-linear-gradient(-67.5deg, #bae6fd, #bae6fd 20px, #7dd3fc 20px, #7dd3fc 40px)',
              right: `${100 - progress.progress}%`,
            }}
          />
          <div
            className="absolute text-sm leading-[40px] text-neutral-900"
            style={{
              right: `${Math.max(100 - progress.progress, 5)}%`,
              transform: 'translateX(150%)',
            }}
          >
            {formatNumber(progress.progress, undefined, {
              maximumFractionDigits: 0,
            })}
            %
          </div>
        </Progress.Root>
      )}
      <div className="text-sm text-neutral-500">{progress.text}</div>
    </div>
  );
}
