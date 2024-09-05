import { AnchorProvider, Wallet } from '@coral-xyz/anchor';

import {
  GatewayClient,
  QuadraticClient,
} from '@solana/governance-program-library';
import {
  createSetRealmConfig,
  GoverningTokenType,
  GoverningTokenConfigAccountArgs,
  tryGetRealmConfig,
  getRealm,
  SYSTEM_PROGRAM_ID,
} from '@solana/spl-governance';
import {
  getGovernanceProgramVersion
} from "@realms-today/spl-governance"
import type {
  Connection,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';

import {
  configureCivicRegistrarIx,
  createCivicRegistrarIx,
} from '../../../GatewayPlugin/sdk/api';
import {
  coefficientsEqual,
  configureQuadraticRegistrarIx,
  createQuadraticRegistrarIx,
  DEFAULT_COEFFICIENTS,
} from '../../../QuadraticPlugin/sdk/api';
import { DEFAULT_QV_CONFIG } from '@hub/components/EditRealmConfig/VotingStructureSelector';
import {
  getMaxVoterWeightRecord,
  getRegistrarPDA,
} from '@utils/plugin/accounts';
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient';

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

const configUsesVoterWeightPlugin = (config: Config, plugin: PublicKey) =>
  config.configAccount.communityTokenConfig.voterWeightAddin?.equals(plugin);

export async function createTransaction(
  realmPublicKey: PublicKey,
  governance: PublicKey,
  config: Config,
  currentConfig: Config,
  connection: Connection,
  isDevnet?: boolean,
  wallet?: Omit<Wallet, 'payer'>,
) {
  const realmAccount = await getRealm(connection, realmPublicKey);

  const programId = realmAccount.owner;
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

  if (realmAccount.account.authority && wallet) {
    const defaultOptions = AnchorProvider.defaultOptions();
    const anchorProvider = new AnchorProvider(
      connection,
      wallet,
      defaultOptions,
    );

    if (
      config.nftCollection &&
      (!currentConfig.nftCollection ||
        !currentConfig.nftCollection.equals(config.nftCollection) ||
        currentConfig.nftCollectionSize !== config.nftCollectionSize ||
        !currentConfig.nftCollectionWeight.eq(config.nftCollectionWeight))
    ) {
      const nftClient = await NftVoterClient.connect(
        anchorProvider,
        undefined,
        isDevnet,
      );
      const { registrar } = getRegistrarPDA(
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
    } else if (
      config.civicPassType &&
      (!currentConfig.civicPassType ||
        !currentConfig.civicPassType.equals(config.civicPassType))
    ) {
      // If this DAO uses Civic, we need to either create or configure the Civic gateway plugin registrar.
      const gatewayClient = await GatewayClient.connect(
        anchorProvider,
        isDevnet,
      );

      const predecessorPlugin = config.chainingEnabled
        ? currentConfig.configAccount.communityTokenConfig.voterWeightAddin
        : undefined;

      const existingRegistrarAccount = await gatewayClient.getRegistrarAccount(
        realmPublicKey,
        config.communityMint.publicKey,
      );

      const instruction = existingRegistrarAccount
        ? await configureCivicRegistrarIx(
            realmAccount,
            gatewayClient,
            config.civicPassType,
          )
        : await createCivicRegistrarIx(
            realmAccount,
            wallet.publicKey,
            gatewayClient,
            config.civicPassType,
            predecessorPlugin,
          );

      instructions.push(instruction);
    } else if (
      (config.qvCoefficients &&
        !coefficientsEqual(
          config.qvCoefficients,
          currentConfig.qvCoefficients,
        )) ||
      (configUsesVoterWeightPlugin(config, DEFAULT_QV_CONFIG.votingProgramId) &&
        !configUsesVoterWeightPlugin(
          currentConfig,
          DEFAULT_QV_CONFIG.votingProgramId,
        ))
    ) {
      // Configure the registrar for the quadratic voting plugin for the DAO
      // Since QV needs to be paired up with some other plugin that protects against sybil attacks,
      // it will typically have a predecessor plugin (e.g. the Civic Gateway plugin)
      const predecessorPlugin = config.chainingEnabled
        ? currentConfig.configAccount.communityTokenConfig.voterWeightAddin
        : undefined;

      const quadraticClient = await QuadraticClient.connect(
        anchorProvider,
        isDevnet,
      );

      const existingRegistrarAccount = await quadraticClient.getRegistrarAccount(
        realmPublicKey,
        config.communityMint.publicKey,
      );

      // if the update is a simple coefficient update, do not change the predecessor unless also set specifically
      // Note - the UI is somewhat overloaded here and it would be nicer differentiate
      // between updates and new plugins being added to the chain
      const isCoefficientUpdate =
        existingRegistrarAccount &&
        config.qvCoefficients &&
        !coefficientsEqual(config.qvCoefficients, currentConfig.qvCoefficients);
      const previousVoterWeightPluginProgramId =
        predecessorPlugin ??
        (isCoefficientUpdate
          ? existingRegistrarAccount.previousVoterWeightPluginProgramId
          : undefined);

      const instruction = existingRegistrarAccount
        ? await configureQuadraticRegistrarIx(
            realmAccount,
            quadraticClient,
            config.qvCoefficients || DEFAULT_COEFFICIENTS,
            // keep the existing predecessor when updating the coefficients
            previousVoterWeightPluginProgramId,
          )
        : await createQuadraticRegistrarIx(
            realmAccount,
            wallet.publicKey,
            quadraticClient,
            config.qvCoefficients || DEFAULT_COEFFICIENTS,
            predecessorPlugin,
          );

      instructions.push(instruction);
    }
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
