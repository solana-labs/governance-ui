import {
  withCreateGovernance,
  withCreateNativeTreasury,
} from '@solana/spl-governance';
import { TransactionInstruction } from '@solana/web3.js';

import { useCallback } from 'react';
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore';

import { rules2governanceConfig } from '../EditWalletRules/createTransaction';
import { useLegacyVoterWeight } from '@hooks/queries/governancePower';
import { useRealmQuery } from '@hooks/queries/realm';
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext';
import useProgramVersion from '@hooks/useProgramVersion';
import useWalletOnePointOh from '@hooks/useWalletOnePointOh';
import { chunks } from '@utils/helpers';
import { trySentryLog } from '@utils/logs';
import {
  SequenceType,
  sendTransactionsV3,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions';

import useGovernanceDefaults from './useGovernanceDefaults';

const useNewWalletCallback = (
  rules?: ReturnType<typeof useGovernanceDefaults>,
) => {
  const wallet = useWalletOnePointOh();
  const connection = useLegacyConnectionContext();
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient,
  );
  const programVersion = useProgramVersion();
  const realm = useRealmQuery().data?.result;
  const { result: ownVoterWeight } = useLegacyVoterWeight();

  const tokenOwnerRecord = ownVoterWeight?.canCreateGovernanceUsingCouncilTokens()
    ? ownVoterWeight.councilTokenRecord
    : realm && ownVoterWeight?.canCreateGovernanceUsingCommunityTokens(realm)
    ? ownVoterWeight.communityTokenRecord
    : undefined;

  return useCallback(async () => {
    if (rules === undefined) throw new Error();
    if (realm === undefined) throw new Error();
    if (programVersion === undefined) throw new Error();
    if (!wallet?.publicKey) throw new Error('not signed in');
    if (tokenOwnerRecord === undefined)
      throw new Error('insufficient voting power');

    const config = await rules2governanceConfig(
      connection.current,
      realm.pubkey,
      rules,
    );

    const instructions: TransactionInstruction[] = [];
    const createNftTicketsIxs: TransactionInstruction[] = [];

    // client is typed such that it cant be undefined, but whatever.
    const plugin = await client?.withUpdateVoterWeightRecord(
      instructions,
      tokenOwnerRecord,
      'createGovernance',
      createNftTicketsIxs,
    );

    const governanceAddress = await withCreateGovernance(
      instructions,
      realm.owner,
      programVersion,
      realm.pubkey,
      undefined,
      config,
      tokenOwnerRecord.pubkey,
      wallet.publicKey,
      wallet.publicKey,
      plugin?.voterWeightPk,
    );
    await withCreateNativeTreasury(
      instructions,
      realm.owner,
      programVersion,
      governanceAddress,
      wallet.publicKey,
    );

    // createTicketIxs is a list of instructions that create nftActionTicket only for nft-voter-v2 plugin
    // so it will be empty for other plugins
    const nftTicketAccountsChuncks = chunks(createNftTicketsIxs, 1);

    await sendTransactionsV3({
      transactionInstructions: [
        ...nftTicketAccountsChuncks.map((txBatch, batchIdx) => {
          return {
            instructionsSet: txBatchesToInstructionSetWithSigners(
              txBatch,
              [],
              batchIdx,
            ),
            sequenceType: SequenceType.Parallel,
          };
        }),
        {
          instructionsSet: instructions.map((x) => ({
            transactionInstruction: x,
          })),
          sequenceType: SequenceType.Sequential,
        },
      ],
      connection: connection.current,
      wallet: wallet,
    });

    const logInfo = {
      realmId: realm.pubkey.toBase58(),
      realmSymbol: realm.account.name,
      wallet: wallet.publicKey?.toBase58(),
      governanceAddress: governanceAddress,
      cluster: connection.cluster,
    };
    trySentryLog({
      tag: 'governanceCreated',
      objToStringify: logInfo,
    });
  }, [rules, realm, wallet, tokenOwnerRecord]);
};

export default useNewWalletCallback;
