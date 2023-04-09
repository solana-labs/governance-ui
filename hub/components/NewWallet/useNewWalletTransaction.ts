import { GovernanceConfig, withCreateGovernance } from '@solana/spl-governance';
import { Keypair, TransactionInstruction } from '@solana/web3.js';

import useVotePluginsClientStore from 'stores/useVotePluginsClientStore';

import useProgramVersion from '@hooks/useProgramVersion';
import useRealm from '@hooks/useRealm';
import useWalletOnePointOh from '@hooks/useWalletOnePointOh';

const useNewWalletTransaction = (config: GovernanceConfig) => {
  const wallet = useWalletOnePointOh();
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient,
  );
  const programVersion = useProgramVersion();

  const {
    realmInfo,
    realm,
    mint: realmMint,
    councilMint,
    symbol,
    ownVoterWeight,
  } = useRealm();

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

    const instructions: TransactionInstruction[] = [];
    const signers: Keypair[] = [];

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
  };
};

export default useNewWalletTransaction;
