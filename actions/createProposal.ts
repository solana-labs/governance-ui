import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import {
  getGovernanceProgramVersion,
  getInstructionDataFromBase64,
  getSignatoryRecordAddress,
  Governance,
  ProgramAccount,
  Realm,
  VoteType,
  VoteTypeKind,
} from '@solana/spl-governance';
import { withAddSignatory } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';
import { withInsertTransaction } from '@solana/spl-governance';
import { InstructionData } from '@solana/spl-governance';
import { sendTransaction } from 'utils/send';
import { withSignOffProposal } from '@solana/spl-governance';
import { sendTransactions, SequenceType } from '@utils/sendTransactions';
import { chunks } from '@utils/helpers';
import { FormInstructionData } from '@utils/uiTypes/proposalCreationTypes';
import borsh from './borsh';
import { CreateProposalArgs } from './types';
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client';

export interface InstructionDataWithHoldUpTime {
  data: InstructionData | null;
  holdUpTime: number | undefined;
  prerequisiteInstructions: TransactionInstruction[];
  chunkSplitByDefault?: boolean;
  signers?: Keypair[];
  shouldSplitIntoSeparateTxs?: boolean | undefined;
}

export async function createProposalInstruction({
  proposalName,
  proposalDescriptionLink,
  governance,
  authority,
  tokenOwnerRecord,
  governanceProgram,
  governingTokenMint,
  governanceRealm,
  payer,
}: {
  proposalName: string;
  proposalDescriptionLink: string;
  governance: PublicKey;
  authority: PublicKey;
  tokenOwnerRecord: PublicKey;
  governanceProgram: PublicKey;
  governingTokenMint: PublicKey;
  governanceRealm: PublicKey;
  payer: PublicKey;
}): Promise<{
  instruction: TransactionInstruction;
  proposalAddress: PublicKey;
}> {
  const proposalSeed = new Keypair().publicKey;

  const [proposalAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('governance'),
      governance.toBuffer(),
      governingTokenMint.toBuffer(),
      proposalSeed.toBuffer(),
    ],
    governanceProgram,
  );

  const [realmConfig] = await PublicKey.findProgramAddress(
    [Buffer.from('realm-config'), governanceRealm.toBuffer()],
    governanceProgram,
  );

  const [proposalDepositAddress] = await PublicKey.findProgramAddress(
    [
      Buffer.from('proposal-deposit'),
      proposalAddress.toBuffer(),
      payer.toBuffer(),
    ],
    governanceProgram,
  );

  console.log('proposalDepositAddress', proposalDepositAddress.toBase58());
  console.log('proposalAddress', proposalAddress.toBase58());

  const data = Buffer.from(
    borsh.serialize(
      new Map([
        [
          CreateProposalArgs,
          {
            kind: 'struct',
            fields: [
              ['instruction', 'u8'],
              ['name', 'string'],
              ['descriptionLink', 'string'],
              ['voteType', 'voteType'],
              ['options', ['string']],
              ['useDenyOption', 'u8'],
              ['proposalSeed', 'pubkey'],
            ],
          },
        ],
      ]),
      new CreateProposalArgs({
        name: proposalName,
        descriptionLink: proposalDescriptionLink,
        governingTokenMint,

        // Same as what is coded in governance-ui
        voteType: new VoteType({
          type: VoteTypeKind.SingleChoice,
          choiceCount: undefined,
        }),
        // Same as what is coded in governance-ui
        options: ['Approve'],
        // Same as what is coded in governance-ui
        useDenyOption: true,
        // Same as what is coded in spl-governance
        proposalSeed,
      }),
    ),
  );

  const itx = new TransactionInstruction({
    keys: [
      {
        pubkey: governanceRealm,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: proposalAddress,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: governance,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: tokenOwnerRecord,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: governingTokenMint,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: authority,
        isWritable: false,
        isSigner: true,
      },
      {
        pubkey: payer,
        isWritable: true,
        isSigner: true,
      },
      {
        pubkey: SystemProgram.programId,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: realmConfig,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: proposalDepositAddress,
        isWritable: true,
        isSigner: false,
      },
    ],
    programId: governanceProgram,
    data,
  });

  return {
    instruction: itx,
    proposalAddress,
  };
}

export class InstructionDataWithHoldUpTime {
  constructor({
    instruction,
    governance,
  }: {
    instruction: FormInstructionData;
    governance?: ProgramAccount<Governance>;
  }) {
    this.data = instruction.serializedInstruction
      ? getInstructionDataFromBase64(instruction.serializedInstruction)
      : null;
    this.holdUpTime =
      typeof instruction.customHoldUpTime !== undefined
        ? instruction.customHoldUpTime
        : governance?.account?.config.minInstructionHoldUpTime;

    this.prerequisiteInstructions = instruction.prerequisiteInstructions || [];
    this.chunkSplitByDefault = instruction.chunkSplitByDefault || false;
  }
}

export const createProposal = async (
  { connection, wallet, programId, walletPubkey }: RpcContext,
  realm: ProgramAccount<Realm>,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  _proposalIndex: number,
  instructionsData: InstructionDataWithHoldUpTime[],
  isDraft: boolean,
  _client?: VsrClient,
): Promise<PublicKey> => {
  const instructions: TransactionInstruction[] = [];

  const governanceAuthority = walletPubkey;
  const signatory = walletPubkey;
  const payer = walletPubkey;
  const notificationTitle = isDraft ? 'proposal draft' : 'proposal';
  const prerequisiteInstructions: TransactionInstruction[] = [];

  // sum up signers
  const signers: Keypair[] = instructionsData.flatMap((x) => x.signers ?? []);
  const shouldSplitIntoSeparateTxs: boolean = instructionsData
    .flatMap((x) => x.shouldSplitIntoSeparateTxs)
    .some((x) => x);

  // Explicitly request the version before making RPC calls to work around race conditions in resolving
  // the version for RealmInfo
  const programVersion = await getGovernanceProgramVersion(
    connection,
    programId,
  );

  /*

  //
  // V2 way to create proposal
  //


  // V2 Approve/Deny configuration
  const voteType = VoteType.SINGLE_CHOICE;
  const options = ['Approve'];
  const useDenyOption = true;

  //will run only if plugin is connected with realm
  const voterWeight = await withUpdateVoterWeightRecord(
    instructions,
    wallet.publicKey!,
    realm,
    client,
  );

  await withCreateProposal(
    instructions,
    programId,
    programVersion,
    realm.pubkey!,
    governance,
    tokenOwnerRecord,
    name,
    descriptionLink,
    governingTokenMint,
    governanceAuthority,
    proposalIndex,
    voteType,
    options,
    useDenyOption,
    payer,
    voterWeight,
  );
  */

  //
  // V3 way to create proposals
  //

  const { proposalAddress, instruction } = await createProposalInstruction({
    proposalName: name,
    proposalDescriptionLink: descriptionLink,
    governance,
    authority: governanceAuthority,
    tokenOwnerRecord,
    governanceProgram: programId,
    governingTokenMint,
    governanceRealm: realm.pubkey,
    payer,
  });

  instructions.push(instruction);

  await withAddSignatory(
    instructions,
    programId,
    programVersion,
    proposalAddress,
    tokenOwnerRecord,
    governanceAuthority,
    signatory,
    payer,
  );

  // TODO: Return signatoryRecordAddress from the SDK call
  const signatoryRecordAddress = await getSignatoryRecordAddress(
    programId,
    proposalAddress,
    signatory,
  );

  const insertInstructions: TransactionInstruction[] = [];
  const splitToChunkByDefault = instructionsData.filter(
    (x) => x.chunkSplitByDefault,
  ).length;

  for (const [index, instruction] of instructionsData
    .filter((x) => x.data)
    .entries()) {
    if (instruction.data) {
      if (instruction.prerequisiteInstructions) {
        prerequisiteInstructions.push(...instruction.prerequisiteInstructions);
      }
      await withInsertTransaction(
        insertInstructions,
        programId,
        programVersion,
        governance,
        proposalAddress,
        tokenOwnerRecord,
        governanceAuthority,
        index,
        0,
        instruction.holdUpTime || 0,
        [instruction.data],
        payer,
      );
    }
  }

  const insertInstructionCount = insertInstructions.length;

  if (!isDraft) {
    withSignOffProposal(
      insertInstructions, // SingOff proposal needs to be executed after inserting instructions hence we add it to insertInstructions
      programId,
      programVersion,
      realm.pubkey,
      governance,
      proposalAddress,
      signatory,
      signatoryRecordAddress,
      undefined,
    );
  }

  if (shouldSplitIntoSeparateTxs) {
    const transaction1 = new Transaction();
    const transaction2 = new Transaction();

    transaction1.add(...prerequisiteInstructions, ...instructions);
    transaction2.add(...insertInstructions);

    await sendTransaction({
      transaction: transaction1,
      wallet,
      connection,
      signers,
      sendingMessage: `creating ${notificationTitle}`,
      successMessage: `${notificationTitle} created`,
    });

    await sendTransaction({
      transaction: transaction2,
      wallet,
      connection,
      signers: undefined,
      sendingMessage: `inserting into ${notificationTitle}`,
      successMessage: `inserted into ${notificationTitle}`,
    });
  } else if (insertInstructionCount <= 2 && !splitToChunkByDefault) {
    // This is an arbitrary threshold and we assume that up to 2 instructions can be inserted as a single Tx
    // This is conservative setting and we might need to revise it if we have more empirical examples or
    // reliable way to determine Tx size
    const transaction = new Transaction();
    // We merge instructions with prerequisiteInstructions
    // Prerequisite  instructions can came from instructions as something we need to do before instruction can be executed
    // For example we create ATAs if they don't exist as part of the proposal creation flow
    transaction.add(
      ...prerequisiteInstructions,
      ...instructions,
      ...insertInstructions,
    );

    await sendTransaction({
      transaction,
      wallet,
      connection,
      signers,
      sendingMessage: `creating ${notificationTitle}`,
      successMessage: `${notificationTitle} created`,
    });
  } else {
    const insertChunks = chunks(insertInstructions, 2);
    const signerChunks = Array(insertChunks.length).fill([]);

    console.info(`Creating proposal using ${insertChunks.length} chunks`);

    await sendTransactions(
      connection,
      wallet,
      [prerequisiteInstructions, instructions, ...insertChunks],
      [[], [], ...signerChunks],
      SequenceType.Sequential,
    );
  }

  return proposalAddress;
};
