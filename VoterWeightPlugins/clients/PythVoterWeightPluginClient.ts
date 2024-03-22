import {Client} from "@solana/governance-program-library";
import {PublicKey, TransactionInstruction} from "@solana/web3.js";
import BN from "bn.js";
import {PythClient, StakeConnection} from "@pythnetwork/staking";
import {Provider, Wallet} from "@coral-xyz/anchor";
import {VoterWeightAction} from "@solana/spl-governance";
import {convertVoterWeightActionToType} from "../lib/utils";

// A wrapper for the PythClient from @pythnetwork/staking, that implements the generic plugin client interface
export class PythVoterWeightPluginClient extends Client<any> {
    readonly requiresInputVoterWeight = false;
    // The pyth plugin does not have a registrar account
    async getRegistrarAccount(): Promise<null> {
        return null;
    }

    getMaxVoterWeightRecordPDA() {
        return {
            maxVoterWeightPk: this.maxVoterWeightPkCached,
            maxVoterWeightRecordBump: 0         // TODO This is wrong for Pyth - but it doesn't matter as it is not used
        }
    }

    // NO-OP Pyth records are created through the Pyth dApp.
    async createVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    // NO-OP
    async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    async updateVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey, action: VoterWeightAction, inputRecordCallback?: () => Promise<PublicKey>, target?: PublicKey) {
        const stakeAccount = await this.client.getMainAccount(voter)

        if (!stakeAccount) throw new Error("Stake account not found for voter");

        const instructions: TransactionInstruction[] = [];

        await this.client.withUpdateVoterWeight(
            instructions,
            stakeAccount!,
            { [convertVoterWeightActionToType(action)]: {} } as any,
            target
        )

        instructions.forEach((instruction, i) => {
            console.log("instruction:", i);
            instruction.keys.filter(k => k.isSigner).forEach(k => {
                console.log("signer:", k.pubkey.toBase58());
            })
        })

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
    constructor(program: typeof PythClient.prototype.program, private client: StakeConnection, devnet:boolean, private maxVoterWeightPkCached: PublicKey) {
        super(program, devnet);
    }

    static async connect(provider: Provider, devnet = false, wallet: Wallet): Promise<PythVoterWeightPluginClient> {
        const pythClient = await PythClient.connect(
            provider.connection,
            wallet
        )

        // The pyth voting client only exposes its max voter weight record using an async function.
        // Since the VoterWeightPluginClient needs it in a synchronous context, we need to cache it here.
        const maxVoterWeightPkCached = (await pythClient.program.methods.updateMaxVoterWeight().pubkeys()).maxVoterRecord

        if (!maxVoterWeightPkCached) throw new Error("Max voter weight record not found");
        return new PythVoterWeightPluginClient(pythClient.program, pythClient, devnet, maxVoterWeightPkCached);
    }
}