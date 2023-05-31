import {
  getRealms,
  getGovernanceAccounts,
  getNativeTreasuryAddress,
  ProgramAccount,
  Proposal,
  TokenOwnerRecord,
  VoteRecord,
} from '@solana/spl-governance';
import { Connection, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';

import type { Logger } from '../Logs';
import { WSOL_MINT_PK } from '@components/instructions/tools';
import { abbreviateAddress } from '@hub/lib/abbreviateAddress';
import { DEFAULT_NFT_VOTER_PLUGIN } from '@tools/constants';
import { getRealmConfigAccountOrDefault } from '@tools/governance/configs';
import group from '@utils/group';
import { pause } from '@utils/pause';
import tokenPriceService from '@utils/services/tokenPrice';
import { tryGetMint } from '@utils/tokens';
import { getAllSplGovernanceProgramIds } from 'pages/api/tools/realms';

import { getGovernances } from './getGovernances';
import { getTokenAmount } from './getTokenAmount';

export interface Update {
  progress: number;
  text: string;
  title: string;
}

export async function fetchData(
  connection: Connection,
  logger: Logger,
  cbs: {
    onComplete?(): void;
    onMembersComplete?(members: Set<string>): void;
    onNFTRealms?(realms: PublicKey[]): void;
    onNFTRealmsComplete?(realms: PublicKey[]): void;
    onProposalsComplete?(proposals: ProgramAccount<Proposal>[]): void;
    onRealmsComplete?(realms: PublicKey[]): void;
    onTVLComplete?(
      value: number,
      byDaos: { [name: string]: number },
      byDaosAndTokens: {
        [name: string]: {
          [token: string]: number;
        };
      },
    ): void;
    onUpdate?(update: Update): void;
    onVoteRecordsComplete?(voteRecords: ProgramAccount<VoteRecord>[]): void;
  },
) {
  const tokenAmountMap = new Map<string, BigNumber>();
  const tokensByDAOAmountMap: {
    [dao: string]: {
      [token: string]: BigNumber;
    };
  } = {};
  const tokenNameMap: {
    [mintPk: string]: string;
  } = {};

  const updateTokenAmount = (mintPk: PublicKey, amount: BN, realm: string) => {
    const mintKey = mintPk.toBase58();
    tokenAmountMap.set(
      mintKey,
      (tokenAmountMap.get(mintKey) ?? new BigNumber(0)).plus(
        new BigNumber(amount.toString()),
      ),
    );

    if (!tokensByDAOAmountMap[realm]) {
      tokensByDAOAmountMap[realm] = {};
    }

    if (!tokensByDAOAmountMap[realm][mintKey]) {
      tokensByDAOAmountMap[realm][mintKey] = new BigNumber(0);
    }

    tokensByDAOAmountMap[realm][mintKey] = tokensByDAOAmountMap[realm][
      mintKey
    ].plus(new BigNumber(amount.toString()));
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

  cbs.onRealmsComplete?.(allRealms.map((r) => r.publicKey));

  const nftRealms: PublicKey[] = [];

  const allRealmEntries = group(Array.from(allRealms.entries()), 50);

  await allRealmEntries.reduce((acc, realmEntries, idx) => {
    return acc
      .then(() => {
        cbs.onUpdate?.({
          progress: 5 + 50 * (idx / allRealmEntries.length),
          text: `Fetching wallets and tokens in: ${realmEntries
            .map(([, r]) => r.name)
            .join(', ')}`,
          title: 'Getting Realm details',
        });
      })
      .then(() =>
        Promise.all(
          realmEntries.map(async ([, realm]) => {
            logger.log(`Fetching "${realm.name}" wallets and tokens...`);

            const realmConfig = await getRealmConfigAccountOrDefault(
              connection,
              realm.programId,
              realm.publicKey,
            );

            // Get NFT DAOs
            if (
              realmConfig.account.communityTokenConfig.voterWeightAddin?.equals(
                new PublicKey(DEFAULT_NFT_VOTER_PLUGIN),
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

            await Promise.all(
              governanceAddrs.map(async (governanceAddress) => {
                // Check governance owned token accounts
                try {
                  const solWalletPk = await getNativeTreasuryAddress(
                    realm.programId,
                    governanceAddress,
                  );
                  const tokenAccounts = await getTokenAmount(
                    connection,
                    governanceAddress,
                  );
                  const moreTokenAccounts = await getTokenAmount(
                    connection,
                    solWalletPk,
                  );

                  for (const tokenAccount of tokenAccounts
                    .concat(moreTokenAccounts)
                    .filter((ta) => !ta.account.amount.isZero())) {
                    updateTokenAmount(
                      tokenAccount.account.mint,
                      tokenAccount.account.amount,
                      realm.name,
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

                  const solWallet = await connection.getAccountInfo(
                    solWalletPk,
                  );

                  if (solWallet) {
                    if (solWallet.lamports > 0) {
                      updateTokenAmount(
                        WSOL_MINT_PK,
                        new BN(solWallet.lamports),
                        realm.name,
                      );
                    }
                  }
                } catch (e) {
                  logger.error('Error fetching sol accounts:');
                  logger.error(String(e));
                }
              }),
            );
          }),
        ),
      )
      .then(() => pause(500));
  }, Promise.resolve(true));

  const mapping: {
    ownTokens: {
      [mint: string]: BigNumber;
    };
    tvl: {
      [mint: string]: BigNumber;
    };
  } = {
    ownTokens: {},
    tvl: {},
  };

  for (const [, amounts] of Object.entries(tokensByDAOAmountMap)) {
    for (const [mint, amount] of Object.entries(amounts)) {
      if (
        mint === WSOL_MINT_PK.toBase58() ||
        mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      ) {
        if (!mapping.tvl[mint]) {
          mapping.tvl[mint] = new BigNumber(0);
        }

        mapping.tvl[mint] = mapping.tvl[mint].plus(amount);
      } else {
        if (!mapping.ownTokens[mint]) {
          mapping.ownTokens[mint] = new BigNumber(0);
        }

        mapping.ownTokens[mint] = mapping.ownTokens[mint].plus(amount);
      }
    }
  }

  cbs.onNFTRealms?.(nftRealms);
  cbs.onNFTRealmsComplete?.(nftRealms);
  cbs.onUpdate?.({
    progress: 55,
    text: 'Fetching token prices...',
    title: 'Calculating account values',
  });

  logger.log('fetching tokens and prices...');
  logger.log(`token count: ${tokenAmountMap.size}`);

  await tokenPriceService.fetchSolanaTokenList();
  const relevantTokens = Array.from(tokenAmountMap.keys()).filter(
    (key) => !!tokenAmountMap.get(key)?.isGreaterThan(1),
  );
  const tokenGroups = group(relevantTokens, 50);

  for (const [idx, tokenGroup] of tokenGroups.entries()) {
    cbs.onUpdate?.({
      progress: 55 + 20 * (idx / tokenGroups.length),
      text: `Fetching token prices (${idx + 1}/${tokenGroups.length})...`,
      title: 'Calculating account values',
    });

    await tokenPriceService.fetchTokenPrices(tokenGroup);
    await pause(1000);
  }

  let totalUsdAmount = 0;

  cbs.onUpdate?.({
    progress: 75,
    text: 'Computing total value...',
    title: 'Calculating account values',
  });

  for (const [mintPk, amount] of tokenAmountMap.entries()) {
    const tokenUsdPrice = tokenPriceService.getUSDTokenPrice(mintPk);
    if (tokenUsdPrice > 0) {
      const mint = await tryGetMint(connection, new PublicKey(mintPk));
      const decimalAmount = amount.shiftedBy(-(mint?.account.decimals || 0));
      const usdAmount = decimalAmount.toNumber() * tokenUsdPrice;

      if (!tokenNameMap[mintPk]) {
        const tokenInfo = tokenPriceService.getTokenInfo(mintPk);

        if (tokenInfo) {
          tokenNameMap[mintPk] =
            tokenInfo.symbol || tokenInfo.name || abbreviateAddress(mintPk);
        } else {
          tokenNameMap[mintPk] = abbreviateAddress(mintPk);
        }
      }

      totalUsdAmount += usdAmount;
    }
  }

  const tvlPerDao: {
    [dao: string]: number;
  } = {};

  const tvlPerDaoAndToken: {
    [dao: string]: {
      [token: string]: number;
    };
  } = {};

  for (const [dao, tokens] of Object.entries(tokensByDAOAmountMap)) {
    let totalDaoTvl = 0;

    for (const [mintPk, amount] of Object.entries(tokens)) {
      const tokenUsdPrice = tokenPriceService.getUSDTokenPrice(mintPk);

      if (tokenUsdPrice > 0) {
        const mint = await tryGetMint(connection, new PublicKey(mintPk));
        const decimalAmount = amount.shiftedBy(-(mint?.account.decimals || 0));
        const usdAmount = decimalAmount.toNumber() * tokenUsdPrice;

        if (!tvlPerDaoAndToken[dao]) {
          tvlPerDaoAndToken[dao] = {};
        }

        const tokenName = tokenNameMap[mintPk] || abbreviateAddress(mintPk);

        tvlPerDaoAndToken[dao][tokenName] = usdAmount;
        totalDaoTvl += usdAmount;
      }
    }

    if (totalDaoTvl > 0) {
      tvlPerDao[dao] = totalDaoTvl;
    }
  }

  cbs.onTVLComplete?.(totalUsdAmount, tvlPerDao, tvlPerDaoAndToken);

  cbs.onUpdate?.({
    progress: 85,
    text: 'Fetching proposals...',
    title: 'Getting vote statistics',
  });

  logger.log('Fetching proposals...');
  let allProposals: ProgramAccount<Proposal>[] = [];

  for (const programId of allProgramIds) {
    const allProgramProposals = await getGovernanceAccounts(
      connection,
      new PublicKey(programId),
      Proposal,
    );

    allProposals = allProposals.concat(allProgramProposals);
  }

  cbs.onProposalsComplete?.(allProposals);

  cbs.onUpdate?.({
    progress: 90,
    text: 'Fetching vote records...',
    title: 'Getting vote statistics',
  });

  logger.log('Fetching vote records...');
  let allVoteRecords: ProgramAccount<VoteRecord>[] = [];

  for (const programId of allProgramIds) {
    const allProgramVoteRecords = await getGovernanceAccounts(
      connection,
      new PublicKey(programId),
      VoteRecord,
    );

    allVoteRecords = allVoteRecords.concat(allProgramVoteRecords);
  }

  cbs.onVoteRecordsComplete?.(allVoteRecords);

  cbs.onUpdate?.({
    progress: 95,
    text: 'Fetching members...',
    title: 'Getting vote statistics',
  });

  logger.log('Fetching members...');
  let allMembers = new Set<string>();

  for (const programId of allProgramIds) {
    const allOwnerRecords = await getGovernanceAccounts(
      connection,
      new PublicKey(programId),
      TokenOwnerRecord,
    );

    for (const ownerRecord of allOwnerRecords) {
      allMembers = allMembers.add(
        ownerRecord.account.governingTokenOwner.toBase58(),
      );
    }
  }

  cbs.onMembersComplete?.(allMembers);

  cbs.onUpdate?.({
    progress: 100,
    text: '',
    title: 'Complete!',
  });
  cbs.onComplete?.();
}
