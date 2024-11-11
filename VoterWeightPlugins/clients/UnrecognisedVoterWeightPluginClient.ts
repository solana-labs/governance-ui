import {Client} from "@solana/governance-program-library";
import { PublicKey, TransactionInstruction} from "@solana/web3.js";
import BN from "bn.js";
import { Program, Provider} from "@coral-xyz/anchor";

// A passthrough plugin to be used when the UI does not recognise the voter weight plugin
export class UnrecognisedVoterWeightPluginClient extends Client<any> {
    readonly requiresInputVoterWeight = false;
    async getRegistrarAccount(): Promise<null> {
        return null;
    }

    async createVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    async updateVoterWeightRecord() {
        return { pre: [], post: [] }
    }
    // NO-OP
    async updateMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }
    async calculateVoterWeight(voter: PublicKey, realm: PublicKey, mint: PublicKey, inputVoterWeight: BN): Promise<BN | null> {
        // In the absence of other information, just pass through the input voter weight here.
        console.warn(`WARNING: Unrecognised voter weight plugin client used during calculateVoterWeight. Passing through the input voter weight of ${inputVoterWeight.toString()}`);
        return inputVoterWeight;
    }

    static async connect(provider: Provider, programId: PublicKey, devnet = false): Promise<UnrecognisedVoterWeightPluginClient> {
        console.warn("WARNING: Unrecognised voter weight plugin client used.");
        const dummyProgram = new Program(
            {
                version: "",
                name: 'unrecognised',
                accounts: [],
                instructions: []
            }, programId, provider);
        return new UnrecognisedVoterWeightPluginClient(dummyProgram, devnet);
    }
}