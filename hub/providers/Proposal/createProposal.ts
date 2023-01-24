import { Wallet } from '@project-serum/anchor';
import {
  serializeInstructionToBase64,
  getGovernance,
  getRealm,
  getTokenOwnerRecordForRealm,
  getRealmConfigAddress,
  GoverningTokenType,
  GoverningTokenConfig,
  RpcContext,
  GovernanceAccountParser,
  RealmConfigAccount,
  ProgramAccount,
} from '@solana/spl-governance';
import type {
  Connection,
  PublicKey,
  TransactionInstruction,
  Transaction,
} from '@solana/web3.js';

import {
  InstructionDataWithHoldUpTime,
  createProposal as _createProposal,
} from 'actions/createProposal';

import {
  vsrPluginsPks,
  nftPluginsPks,
  gatewayPluginsPks,
  switchboardPluginsPks,
  pythPluginsPks,
} from '@hooks/useVotingPlugins';
import { VotingClient } from '@utils/uiTypes/VotePlugin';

import { fetchPlugins } from './fetchPlugins';

interface Args {
  connection: Connection;
  governancePublicKey: PublicKey;
  governingTokenMintPublicKey: PublicKey;
  instructions: TransactionInstruction[];
  isDraft: boolean;
  programPublicKey: PublicKey;
  proposalDescription: string;
  proposalTitle: string;
  realmPublicKey: PublicKey;
  requestingUserPublicKey: PublicKey;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

export async function createProposal(args: Args) {
  const [
    governance,
    realm,
    tokenOwnerRecord,
    realmConfigPublicKey,
  ] = await Promise.all([
    getGovernance(args.connection, args.governancePublicKey),
    getRealm(args.connection, args.realmPublicKey),
    getTokenOwnerRecordForRealm(
      args.connection,
      args.programPublicKey,
      args.realmPublicKey,
      args.governingTokenMintPublicKey,
      args.requestingUserPublicKey,
    ),
    getRealmConfigAddress(args.programPublicKey, args.realmPublicKey),
  ]);

  const realmConfigAccountInfo = await args.connection.getAccountInfo(
    realmConfigPublicKey,
  );

  const realmConfig: ProgramAccount<RealmConfigAccount> = realmConfigAccountInfo
    ? GovernanceAccountParser(RealmConfigAccount)(
        realmConfigPublicKey,
        realmConfigAccountInfo,
      )
    : {
        pubkey: realmConfigPublicKey,
        owner: args.programPublicKey,
        account: new RealmConfigAccount({
          realm: args.realmPublicKey,
          communityTokenConfig: new GoverningTokenConfig({
            voterWeightAddin: undefined,
            maxVoterWeightAddin: undefined,
            tokenType: GoverningTokenType.Liquid,
            reserved: new Uint8Array(),
          }),
          councilTokenConfig: new GoverningTokenConfig({
            voterWeightAddin: undefined,
            maxVoterWeightAddin: undefined,
            tokenType: GoverningTokenType.Liquid,
            reserved: new Uint8Array(),
          }),
          reserved: new Uint8Array(),
        }),
      };

  const serializedInstructions = args.instructions.map(
    serializeInstructionToBase64,
  );

  const instructionData = serializedInstructions.map(
    (serializedInstruction) =>
      new InstructionDataWithHoldUpTime({
        governance,
        instruction: {
          governance,
          serializedInstruction,
          isValid: true,
        },
      }),
  );

  const proposalIndex = governance.account.proposalCount;
  const votingPlugins = await fetchPlugins(
    args.connection,
    args.programPublicKey,
    {
      publicKey: args.requestingUserPublicKey,
      signTransaction: args.signTransaction,
      signAllTransactions: args.signAllTransactions,
    } as Wallet,
  );

  let votingClient: VotingClient | undefined = undefined;
  const pluginPublicKey =
    realmConfig.account.communityTokenConfig.voterWeightAddin;

  if (pluginPublicKey) {
    const pluginPublicKeyStr = pluginPublicKey.toBase58();
    let client: VotingClient['client'] = undefined;
    // Check for plugins in a particular order. I'm not sure why, but I
    // borrowed this from /hooks/useVotingPlugins.ts
    if (vsrPluginsPks.includes(pluginPublicKeyStr) && votingPlugins.vsrClient) {
      client = votingPlugins.vsrClient;
    }

    if (nftPluginsPks.includes(pluginPublicKeyStr) && votingPlugins.nftClient) {
      client = votingPlugins.nftClient;
    }

    if (
      switchboardPluginsPks.includes(pluginPublicKeyStr) &&
      votingPlugins.switchboardClient
    ) {
      client = votingPlugins.switchboardClient;
    }

    if (
      gatewayPluginsPks.includes(pluginPublicKeyStr) &&
      votingPlugins.gatewayClient
    ) {
      client = votingPlugins.gatewayClient;
    }

    if (
      pythPluginsPks.includes(pluginPublicKeyStr) &&
      votingPlugins.pythClient
    ) {
      client = votingPlugins.pythClient;
    }

    if (client) {
      votingClient = new VotingClient({
        realm,
        client,
        walletPk: args.requestingUserPublicKey,
      });
    }
  }

  return _createProposal(
    {
      connection: args.connection,
      wallet: {
        publicKey: args.requestingUserPublicKey,
        signTransaction: args.signTransaction,
        signAllTransactions: args.signAllTransactions,
      },
      programId: args.programPublicKey,
      walletPubkey: args.requestingUserPublicKey,
    } as RpcContext,
    realm,
    args.governancePublicKey,
    tokenOwnerRecord,
    args.proposalTitle,
    args.proposalDescription,
    args.governingTokenMintPublicKey,
    proposalIndex,
    instructionData,
    args.isDraft,
    votingClient,
  );
}
