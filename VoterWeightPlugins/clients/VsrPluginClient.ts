import {Client} from "@solana/governance-program-library";
import {PublicKey, TransactionInstruction} from "@solana/web3.js";
import BN from "bn.js";
import {Program, Provider} from "@coral-xyz/anchor";
import {SYSTEM_PROGRAM_ID} from "@solana/spl-governance";
import {getVsrGovpower} from "@hooks/queries/plugins/vsr";
import {IDL, VoterStakeRegistry,} from 'VoteStakeRegistry/sdk/voter_stake_registry'
import {getRegistrarPDA, getVoterPDA, getVoterWeightPDA} from "../../VoteStakeRegistry/sdk/accounts";

export class VsrPluginClient extends Client<any> {
    readonly requiresInputVoterWeight = false;

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
        const { registrar } = await getRegistrarPDA(
            realm,
            mint,
            pluginProgramId
        )
        const { voter: voterPDA } = await getVoterPDA(registrar, voter, pluginProgramId)
        const { voterWeightPk } = await getVoterWeightPDA(
            registrar,
            voterPDA,
            pluginProgramId
        )
        const ix = await this.program.methods.updateVoterWeightRecord()
            .accounts({
                registrar,
                voterPDA,
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
        const govPower = await getVsrGovpower(
            this.program.provider.connection,
            realm,
            voter);

        return govPower.found ? govPower.result : null;
    }
    constructor(program: Program<VoterStakeRegistry>, devnet:boolean) {
        super(program, devnet);
    }

    static async connect(provider: Provider, pluginId: PublicKey, devnet = false): Promise<VsrPluginClient> {
        return new VsrPluginClient(
            new Program<VoterStakeRegistry>(IDL, pluginId, provider),
            devnet,
        );
    }
}