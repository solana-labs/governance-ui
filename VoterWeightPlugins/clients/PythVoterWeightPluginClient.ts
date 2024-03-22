import {Client} from "@solana/governance-program-library";
import {PublicKey, TransactionInstruction} from "@solana/web3.js";
import BN from "bn.js";
import {PythClient, StakeAccount, StakeConnection} from "@pythnetwork/staking";
import {Provider, Wallet} from "@coral-xyz/anchor";
import {VoterWeightAction} from "@solana/spl-governance";
import {convertVoterWeightActionToType, queryKeys} from "../lib/utils";
import queryClient from "@hooks/queries/queryClient";

// A wrapper for the PythClient from @pythnetwork/staking, that implements the generic plugin client interface
export class PythVoterWeightPluginClient extends Client<any> {
    readonly requiresInputVoterWeight = false;
    // The pyth plugin does not have a registrar account
    async getRegistrarAccount(): Promise<null> {
        return null;
    }

    async getMaxVoterWeightRecordPDA() {
        const maxVoterWeightPk =  (await this.client.program.methods.updateMaxVoterWeight().pubkeys()).maxVoterRecord

        if (!maxVoterWeightPk) return null;

        return {
            maxVoterWeightPk,
            maxVoterWeightRecordBump: 0         // TODO This is wrong for Pyth - but it doesn't matter as it is not used
        }
    }

    async getVoterWeightRecordPDA(realm: PublicKey, mint: PublicKey, voter: PublicKey) {
        const { voterWeightAccount } = await this.getUpdateVoterWeightPks([], voter, VoterWeightAction.CastVote, PublicKey.default);

        return {
            voterWeightPk: voterWeightAccount,
            voterWeightRecordBump: 0         // TODO This is wrong for Pyth - but it doesn't matter as it is not used
        };
    }

    // NO-OP Pyth records are created through the Pyth dApp.
    async createVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    // NO-OP
    async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    private async getStakeAccount(voter: PublicKey): Promise<StakeAccount> {
        return queryClient.fetchQuery({
            queryKey: ['pyth getStakeAccount', voter],
            queryFn: () => this.client.getMainAccount(voter),
        })
    }

    private async getUpdateVoterWeightPks(instructions: TransactionInstruction[], voter: PublicKey, action: VoterWeightAction, target?: PublicKey) {
        const stakeAccount = await this.getStakeAccount(voter)

        if (!stakeAccount) throw new Error("Stake account not found for voter " + voter.toString());
        return this.client.withUpdateVoterWeight(
            instructions,
            stakeAccount,
            { [convertVoterWeightActionToType(action)]: {} } as any,
            target
        );
    }

    async updateVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey, action: VoterWeightAction, inputRecordCallback?: () => Promise<PublicKey>, target?: PublicKey) {
        let instructions: TransactionInstruction[] = [];
        await this.getUpdateVoterWeightPks(instructions, voter, action, target);

        return { pre: instructions };
    }
    // NO-OP
    async updateMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }
    async calculateVoterWeight(voter: PublicKey): Promise<BN | null> {
        const stakeAccount = await this.getStakeAccount(voter)

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