import {Client} from "@solana/governance-program-library";
import {PublicKey, TransactionInstruction} from "@solana/web3.js";
import BN from "bn.js";
import {Program, Provider} from "@coral-xyz/anchor";
import {VoterStakeRegistry, IDL} from "@helium/idls/lib/types/voter_stake_registry";

export class VsrPluginClient extends Client<any> {

    // NO-OP TODO: Double-check
    async createVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    // NO-OP
    async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    async updateVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey): Promise<TransactionInstruction> {

    }
    // NO-OP
    async updateMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }
    async calculateVoterWeight(voter: PublicKey, realm: PublicKey): Promise<BN | null> {
        // TODO
        return null
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