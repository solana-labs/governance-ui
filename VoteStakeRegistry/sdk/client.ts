import { Program, Provider, web3} from '@coral-xyz/anchor'
import { IDL, VoterStakeRegistry } from './voter_stake_registry'
import {Client} from "@solana/governance-program-library";
import {PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, SYSVAR_RENT_PUBKEY, TransactionInstruction} from "@solana/web3.js";
import {getVoterPDA} from "./accounts";
import {SYSTEM_PROGRAM_ID} from "@solana/spl-governance";
import BN from "bn.js";
import {fetchVotingPower} from "@hooks/queries/plugins/vsr";

export const DEFAULT_VSR_ID = new web3.PublicKey(
  'vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ'
)

export class VsrClient extends Client<typeof IDL> {
  readonly requiresInputVoterWeight = false;

  getRegistrarPDA(realm: PublicKey, mint: PublicKey) {
    const [registrar, registrarBump] = PublicKey.findProgramAddressSync(
        [realm.toBuffer(), Buffer.from('registrar'), mint.toBuffer()],
        this.program.programId
    )
    return {
      registrar,
      registrarBump,
    }
  }

  async getVoterWeightRecordPDA(realm: PublicKey, mint: PublicKey, walletPk: PublicKey) {
    const {registrar} = this.getRegistrarPDA(realm, mint);

    const [voterWeightPk, voterWeightRecordBump] = PublicKey.findProgramAddressSync(
        [
          registrar.toBuffer(),
          Buffer.from('voter-weight-record'),
          walletPk.toBuffer(),
        ],
        this.program.programId
    )

    return {
      voterWeightPk,
      voterWeightRecordBump,
    }
  }


    /**
     * Creates a voter weight record account and voter account for this VSR realm and user.
     * Although the program creates both, this function keeps the 'createVoterWeightRecord' name to align with
     * other plugins. The client code should not need to know the difference.
     * @param voter
     * @param realm
     * @param mint
     */
  async createVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey): Promise<TransactionInstruction> {
    const {registrar} = this.getRegistrarPDA(realm, mint);
    const { voter: voterPDA, voterBump } = getVoterPDA(
        registrar,
        voter,
        this.program.programId
    )
    const { voterWeightPk, voterWeightRecordBump } = await this.getVoterWeightRecordPDA(
        realm,
        mint,
        voter
    )
    return this.program.methods
        .createVoter(voterBump, voterWeightRecordBump)
        .accounts({
          registrar: registrar,
          voter: voterPDA,
          voterAuthority: voter,
          voterWeightRecord: voterWeightPk,
          payer: voter,
          systemProgram: SYSTEM_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .instruction()
  }

  async getVoterWeightRecord(realm: PublicKey, mint: PublicKey, voter: PublicKey) {
      const {registrar} = this.getRegistrarPDA(realm, mint);
      // This is a workaround for the fact that the VSR program IDL does not include the voterWeightRecord account
      const votingPower = await fetchVotingPower(
          this.program.provider.connection,
          this.program.programId,
          registrar,
          voter
      )

      const power = votingPower.result ?? new BN(0);

      return { voterWeight: power };
  }

  // NO-OP
  async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
    return null;
  }

  async updateVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey) {
    const pluginProgramId = this.program.programId;
    const { registrar } = this.getRegistrarPDA(realm, mint)
    const { voter: voterPDA } = getVoterPDA(registrar, voter, pluginProgramId)
    const { voterWeightPk } = await this.getVoterWeightRecordPDA(realm, mint, voter);
    const ix = await this.program.methods.updateVoterWeightRecord()
        .accounts({
          registrar,
          voter: voterPDA,
          voterWeightRecord: voterWeightPk,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .instruction()

    return { pre: [ix] }
  }
  // NO-OP
  async updateMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
    return null;
  }
  async calculateVoterWeight(voter: PublicKey, realm: PublicKey, mint: PublicKey): Promise<BN | null> {
    // TODO should use vsr govpower multi? see useVsrGovpowerMulti
    const { registrar: registrarPk} = this.getRegistrarPDA(realm, mint)
    const programId = this.program.programId;
    if (registrarPk === undefined || programId === undefined) {
      return null
    }

    const { voter: voterPk } = getVoterPDA(registrarPk, voter, programId)
    const votingPower = await fetchVotingPower(
        this.program.provider.connection,
        programId,
        registrarPk,
        voterPk
    )

    return votingPower.result ?? new BN(0);
  }
  constructor(program: Program<VoterStakeRegistry>, devnet:boolean) {
    super(program, devnet);
  }

  static async connect(
    provider: Provider,
    programId: web3.PublicKey = DEFAULT_VSR_ID,
    devnet = false
  ): Promise<VsrClient> {
    const idl = IDL

    return new VsrClient(
      new Program<VoterStakeRegistry>(
        idl as VoterStakeRegistry,
        programId,
        provider
      ) as Program<VoterStakeRegistry>,
      devnet
    )
  }
}
