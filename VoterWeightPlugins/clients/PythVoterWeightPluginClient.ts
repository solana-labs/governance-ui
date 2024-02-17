import {Client} from "@solana/governance-program-library";
import {Keypair, PublicKey, TransactionInstruction} from "@solana/web3.js";
import BN from "bn.js";
import {PythClient, StakeConnection} from "@pythnetwork/staking";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import {Provider} from "@coral-xyz/anchor";
import {VoterWeightAction} from "@solana/spl-governance";

export class PythVoterWeightPluginClient extends Client<any> {
    readonly requiresInputVoterWeight = false;
    // The pyth plugin does not have a registrar account
    async getRegistrarAccount(): Promise<null> {
        return null;
    }

    // NO-OP Pyth records are created through the Pyth dApp. TODO: Double-check
    async createVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    // NO-OP
    async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    async updateVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey, action: VoterWeightAction) {
        const stakeAccount = await this.client.getMainAccount(voter)

        if (!stakeAccount) throw new Error("Stake account not found for voter");

        const instructions: TransactionInstruction[] = [];

        await this.client.withUpdateVoterWeight(
            instructions,
            stakeAccount!,
            { [action]: {} } as any,
            mint
        )

        return { pre: instructions };
    }
    // NO-OP
    async updateMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }
    async calculateVoterWeight(voter: PublicKey): Promise<BN | null> {
        const stakeAccount = await this.client.getMainAccount(voter)

        if (stakeAccount) {
            return stakeAccount.getVoterWeight(await this.client.getTime()).toBN()
        } else {
            return new BN(0)
        }
    }
    constructor(program: typeof PythClient.prototype.program, private client: StakeConnection, devnet:boolean) {
        super(program, devnet);
    }

    static async connect(provider: Provider, devnet = false): Promise<PythVoterWeightPluginClient> {
        const pythClient = await PythClient.connect(
            provider.connection,
            new NodeWallet(new Keypair())
        )
        return new PythVoterWeightPluginClient(pythClient.program, pythClient, devnet);
    }
}