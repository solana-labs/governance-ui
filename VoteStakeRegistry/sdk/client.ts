import { Program, Provider, web3} from '@coral-xyz/anchor'
import { IDL, VoterStakeRegistry } from './voter_stake_registry'
import {Client} from "@solana/governance-program-library";
import {PublicKey, TransactionInstruction} from "@solana/web3.js";
import {getVoterPDA} from "./accounts";
import {SYSTEM_PROGRAM_ID} from "@solana/spl-governance";
import BN from "bn.js";
import {getVsrGovpower} from "@hooks/queries/plugins/vsr";

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

  getVoterWeightRecordPDA(realm: PublicKey, mint: PublicKey, walletPk: PublicKey) {
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

  async getVoterWeightRecord() {
    return null;
  }

  // NO-OP TODO: How are Vsr voter weight records created?
  async createVoterWeightRecord(): Promise<TransactionInstruction | null> {
    return null;
  }

  // NO-OP
  async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
    return null;
  }

  async updateVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey) {
    const pluginProgramId = this.program.programId;
    const { registrar } = this.getRegistrarPDA(realm, mint)
    const { voter: voterPDA } = await getVoterPDA(registrar, voter, pluginProgramId)
    const { voterWeightPk } = this.getVoterWeightRecordPDA(realm, mint, voter);
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
  async calculateVoterWeight(voter: PublicKey, realm: PublicKey): Promise<BN | null> {
    // TODO should use vsr govpower multi? see useVsrGovpowerMulti
    const govPower = await getVsrGovpower(
        this.program.provider.connection,
        realm,
        voter);

    return govPower.found ? govPower.result : null;
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
