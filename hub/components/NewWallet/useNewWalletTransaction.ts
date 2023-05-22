import {
  withCreateGovernance,
  withCreateNativeTreasury,
} from '@solana/spl-governance';
import { TransactionInstruction } from '@solana/web3.js';

import { useCallback } from 'react';
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore';

import useWalletStore from 'stores/useWalletStore';

import { rules2governanceConfig } from '../EditWalletRules/createTransaction';
import { useRealmQuery } from '@hooks/queries/realm';
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext';
import useProgramVersion from '@hooks/useProgramVersion';
import useRealm from '@hooks/useRealm';
import useWalletOnePointOh from '@hooks/useWalletOnePointOh';
import { trySentryLog } from '@utils/logs';
import { SequenceType, sendTransactionsV3 } from '@utils/sendTransactions';

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
  const { ownVoterWeight } = useRealm();

  const tokenOwnerRecord = ownVoterWeight.canCreateGovernanceUsingCouncilTokens()
    ? ownVoterWeight.councilTokenRecord
    : realm && ownVoterWeight.canCreateGovernanceUsingCommunityTokens(realm)
    ? ownVoterWeight.communityTokenRecord
    : undefined;

  return useCallback(async () => {
    if (rules === undefined) throw new Error();
    if (realm === undefined) throw new Error();
    if (programVersion === undefined) throw new Error();
    if (!wallet?.publicKey) throw new Error('not signed in');
    if (tokenOwnerRecord === undefined)
      throw new Error('insufficient voting power');

    const config = rules2governanceConfig(rules);

    const instructions: TransactionInstruction[] = [];

    // client is typed such that it cant be undefined, but whatever.
    const plugin = await client?.withUpdateVoterWeightRecord(
      instructions,
      tokenOwnerRecord,
      'createGovernance',
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

    await sendTransactionsV3({
      transactionInstructions: [
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
