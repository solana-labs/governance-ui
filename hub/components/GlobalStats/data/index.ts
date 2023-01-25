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
    onTVLComplete?(value: number): void;
    onUpdate?(update: Update): void;
    onVoteRecordsComplete?(voteRecords: ProgramAccount<VoteRecord>[]): void;
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

  cbs.onRealmsComplete?.(allRealms.map((r) => r.publicKey));

  const nftRealms: PublicKey[] = [];

  for (const [idx, realm] of allRealms.entries()) {
    cbs.onUpdate?.({
      progress: 5 + 50 * (idx / allRealms.length),
      text: `Fetching "${realm.name}" wallets and tokens...`,
      title: 'Getting Realm details',
    });
    logger.log(`Fetching "${realm.name}" wallets and tokens...`);

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
    progress: 55,
    text: 'Fetching token prices...',
    title: 'Calculating account values',
  });

  logger.log('fetching tokens and prices...');
  logger.log(`token count: ${tokenAmountMap.size}`);

  await tokenPriceService.fetchSolanaTokenList();

  const tokenGroups = group(Array.from(tokenAmountMap.keys()), 50);

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
      const priceInfo = tokenPriceService.getPriceInfo(mintPk);
      const symbol = priceInfo?.mintSymbol || mintPk;
      logger.log(
        `Token value for ${symbol}: ${decimalAmount.toFormat(
          2,
        )} * ${tokenUsdPrice.toFixed(2)} = ${usdAmount.toFixed(2)}`,
      );
      totalUsdAmount += usdAmount;
    }
  }

  cbs.onTVLComplete?.(totalUsdAmount);

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
