import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  getGovernanceProgramVersion,
  GovernanceType,
  ProgramAccount,
  Realm,
} from '@solana/spl-governance';
import { GovernanceConfig } from '@solana/spl-governance';
import { withCreateProgramGovernance } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';
import { sendTransaction } from '@utils/send';
import { withUpdateVoterWeightRecord } from 'VoteStakeRegistry/sdk/withUpdateVoterWeightRecord';
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client';

export const registerProgramGovernance = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  governanceType: GovernanceType,
  realm: ProgramAccount<Realm>,
  governedAccount: PublicKey,
  config: GovernanceConfig,
  transferAuthority: boolean,
  tokenOwnerRecord: PublicKey,
  client?: VsrClient,
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = [];
  const signers: Keypair[] = [];
  let governanceAddress;
  const governanceAuthority = walletPubkey;

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId,
  );

  //will run only if plugin is connected with realm
  const voterWeight = await withUpdateVoterWeightRecord(
    instructions,
    wallet.publicKey!,
    realm,
    client,
  );

  console.info('Governance Program version:', programVersion);

  switch (governanceType) {
    case GovernanceType.Program: {
      governanceAddress = await withCreateProgramGovernance(
        instructions,
        programId,
        programVersion,
        realm.pubkey,
        governedAccount,
        config,
        transferAuthority!,
        walletPubkey,
        tokenOwnerRecord,
        walletPubkey,
        governanceAuthority,
        voterWeight,
      );
      break;
    }
    default: {
      throw new Error(
        `Governance type ${governanceType} is not supported yet.`,
      );
    }
  }

  const transaction = new Transaction();
  transaction.add(...instructions);
  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Creating treasury account',
    successMessage: 'Treasury account has been created',
  });

  return governanceAddress;
};
