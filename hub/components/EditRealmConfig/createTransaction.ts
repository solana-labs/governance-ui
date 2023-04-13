import { AnchorProvider, Wallet } from '@project-serum/anchor';
import { NftVoterClient } from '@solana/governance-program-library';
import {
  createSetRealmConfig,
  GoverningTokenType,
  GoverningTokenConfigAccountArgs,
  tryGetRealmConfig,
  getRealm,
  getGovernanceProgramVersion,
  SYSTEM_PROGRAM_ID,
} from '@solana/spl-governance';
import type {
  Connection,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';

import {
  getMaxVoterWeightRecord,
  getRegistrarPDA,
} from '@utils/plugin/accounts';

import { Config } from './fetchConfig';
import { buildUpdates, diff } from './UpdatesList';

function shouldAddConfigInstruction(config: Config, currentConfig: Config) {
  const updates = diff(buildUpdates(currentConfig), buildUpdates(config));

  if (
    updates.communityMaxVotingPlugin ||
    updates.communityTokenType ||
    updates.communityVotingPlugin ||
    updates.councilMaxVotingPlugin ||
    updates.councilTokenType ||
    updates.councilVotingPlugin ||
    updates.maxVoterWeightType ||
    updates.maxVoterWeightValue ||
    updates.minCommunityTokensToCreateGovernance
  ) {
    return true;
  }

  return false;
}

export async function createTransaction(
  realmPublicKey: PublicKey,
  governance: PublicKey,
  config: Config,
  currentConfig: Config,
  connection: Connection,
  isDevnet?: boolean,
  wallet?: Omit<Wallet, 'payer'>,
) {
  const realm = await getRealm(connection, realmPublicKey);
  const programId = realm.owner;
  const instructions: TransactionInstruction[] = [];
  const realmConfig = await tryGetRealmConfig(
    connection,
    programId,
    realmPublicKey,
  );
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId,
  );
  const realmAccount = await getRealm(connection, realmPublicKey);

  if (
    realmAccount.account.authority &&
    wallet &&
    config.nftCollection &&
    (!currentConfig.nftCollection ||
      !currentConfig.nftCollection.equals(config.nftCollection) ||
      currentConfig.nftCollectionSize !== config.nftCollectionSize ||
      !currentConfig.nftCollectionWeight.eq(config.nftCollectionWeight))
  ) {
    const defaultOptions = AnchorProvider.defaultOptions();
    const anchorProvider = new AnchorProvider(
      connection,
      wallet,
      defaultOptions,
    );

    const nftClient = await NftVoterClient.connect(anchorProvider, isDevnet);
    const { registrar } = await getRegistrarPDA(
      realmPublicKey,
      config.communityMint.publicKey,
      nftClient.program.programId,
    );
    const { maxVoterWeightRecord } = await getMaxVoterWeightRecord(
      realmPublicKey,
      config.communityMint.publicKey,
      nftClient.program.programId,
    );

    instructions.push(
      await nftClient.program.methods
        .createRegistrar(10)
        .accounts({
          registrar,
          realm: realmPublicKey,
          governanceProgramId: programId,
          realmAuthority: realmAccount.account.authority,
          governingTokenMint: config.communityMint.publicKey,
          payer: wallet.publicKey,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .instruction(),
    );

    instructions.push(
      await nftClient.program.methods
        .createMaxVoterWeightRecord()
        .accounts({
          maxVoterWeightRecord,
          realm: realmPublicKey,
          governanceProgramId: programId,
          realmGoverningTokenMint: config.communityMint.publicKey,
          payer: wallet.publicKey,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .instruction(),
    );

    instructions.push(
      await nftClient.program.methods
        .configureCollection(
          config.nftCollectionWeight,
          config.nftCollectionSize,
        )
        .accounts({
          registrar,
          realm: realmPublicKey,
          maxVoterWeightRecord,
          realmAuthority: realmAccount.account.authority,
          collection: config.nftCollection,
        })
        .instruction(),
    );
  }

  if (shouldAddConfigInstruction(config, currentConfig)) {
    instructions.push(
      await createSetRealmConfig(
        programId,
        programVersion,
        realmPublicKey,
        governance,
        config.configAccount.councilTokenConfig.tokenType ===
          GoverningTokenType.Dormant
          ? undefined
          : config.config.councilMint,
        config.config.communityMintMaxVoteWeightSource,
        config.config.minCommunityTokensToCreateGovernance,
        new GoverningTokenConfigAccountArgs({
          voterWeightAddin:
            config.configAccount.communityTokenConfig.voterWeightAddin,
          maxVoterWeightAddin:
            config.configAccount.communityTokenConfig.maxVoterWeightAddin,
          tokenType: config.configAccount.communityTokenConfig.tokenType,
        }),
        programVersion === 3
          ? new GoverningTokenConfigAccountArgs({
              voterWeightAddin:
                config.configAccount.councilTokenConfig.voterWeightAddin,
              maxVoterWeightAddin:
                config.configAccount.councilTokenConfig.maxVoterWeightAddin,
              tokenType: config.configAccount.councilTokenConfig.tokenType,
            })
          : undefined,
        !realmConfig ? wallet?.publicKey : undefined,
      ),
    );
  }

  return instructions;
}
