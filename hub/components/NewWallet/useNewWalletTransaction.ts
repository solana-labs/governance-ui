import { withCreateGovernance } from '@solana/spl-governance';
import { Transaction, TransactionInstruction } from '@solana/web3.js';

import useVotePluginsClientStore from 'stores/useVotePluginsClientStore';

import { rules2governanceConfig } from '../EditWalletRules/createTransaction';
import { Rules } from '../EditWalletRules/types';
import useProgramVersion from '@hooks/useProgramVersion';
import useRealm from '@hooks/useRealm';
import useWalletOnePointOh from '@hooks/useWalletOnePointOh';

const useNewWalletTransaction = (rules: Rules) => {
  const wallet = useWalletOnePointOh();
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient,
  );
  const programVersion = useProgramVersion();

  const { realm, ownVoterWeight } = useRealm();

  const tokenOwnerRecord = ownVoterWeight.canCreateGovernanceUsingCouncilTokens()
    ? ownVoterWeight.councilTokenRecord
    : realm && ownVoterWeight.canCreateGovernanceUsingCommunityTokens(realm)
    ? ownVoterWeight.communityTokenRecord
    : undefined;

  return async () => {
    if (realm === undefined) throw new Error();
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

    const transaction = new Transaction().add(...instructions);
    return [transaction, governanceAddress] as const;
  };
};

export default useNewWalletTransaction;
