import {Client} from "@solana/governance-program-library";
import {PublicKey, TransactionInstruction} from "@solana/web3.js";
import BN from "bn.js";
import {Program, Provider, Wallet} from "@coral-xyz/anchor";
import {VoterWeightAction} from "@solana/spl-governance";
import {convertVoterWeightActionToType} from "../lib/utils";
import queryClient from "@hooks/queries/queryClient";
import { getMaxVoterWeightRecordAddress, getVoterWeightRecordAddress, PythStakingClient, StakeAccountPositions } from "@pythnetwork/staking-sdk";

// A wrapper for the PythClient from @pythnetwork/staking, that implements the generic plugin client interface
export class PythVoterWeightPluginClient extends Client<any> {
    readonly requiresInputVoterWeight = false;
    // The pyth plugin does not have a registrar account
    async getRegistrarAccount(): Promise<null> {
        return null;
    }

    async getMaxVoterWeightRecordPDA() {
        const [address, bump] = getMaxVoterWeightRecordAddress();

        return {
            maxVoterWeightPk: address,
            maxVoterWeightRecordBump: bump,
        }
    }

    async getMaxVoterWeightRecord(realm: PublicKey, mint: PublicKey) {
        const {maxVoterWeightPk} = await this.getMaxVoterWeightRecordPDA();
        return this.client.stakingProgram.account.maxVoterWeightRecord.fetch(
            maxVoterWeightPk,
        );
    }

    async getVoterWeightRecordPDA(realm: PublicKey, mint: PublicKey, voter: PublicKey) {
        const stakeAccount = await this.getStakeAccount(voter)
        const [address, bump] = getVoterWeightRecordAddress(stakeAccount.address);

        return {
            voterWeightPk: address,
            voterWeightRecordBump: bump,
        }
    }

    async getVoterWeightRecord(realm: PublicKey, mint: PublicKey, walletPk: PublicKey) {
        const {voterWeightPk} = await this.getVoterWeightRecordPDA(realm, mint, walletPk);
        return this.client.stakingProgram.account.voterWeightRecord.fetch(
            voterWeightPk,
        );
    }

    // NO-OP Pyth records are created through the Pyth dApp.
    async createVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    // NO-OP
    async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    private async getStakeAccount(voter: PublicKey): Promise<StakeAccountPositions> {
        return queryClient.fetchQuery({
            queryKey: ['pyth getStakeAccount', voter],
            queryFn: () => this.client.getMainStakeAccount(voter),
        })
    }

    async updateVoterWeightRecord(
        voter: PublicKey,
        realm: PublicKey,
        mint: PublicKey,
        action: VoterWeightAction,
        inputRecordCallback?: () => Promise<PublicKey>,
        target?: PublicKey
    ) {
        const stakeAccount = await this.getStakeAccount(voter)

        const ix = await this.client.getUpdateVoterWeightInstruction(
            stakeAccount.address,
            { [convertVoterWeightActionToType(action)]: {} } as any,
            target,
        )
        
        return { pre: [ix] };
    }
    // NO-OP
    async updateMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }
    async calculateVoterWeight(voter: PublicKey): Promise<BN | null> {
        const voterWeight = await this.client.getVoterWeight(voter);
        return new BN(voterWeight);
    }
    
    constructor(
        program: Program<any>,
        private client: PythStakingClient
    ) {
        super(program);
    }

    static async connect(provider: Provider, programId: PublicKey, wallet: Wallet): Promise<PythVoterWeightPluginClient> {
        const pythClient = new PythStakingClient({
            connection: provider.connection,
            wallet,
        })

        const dummyProgram = new Program(
            {
                version: "",
                name: 'unrecognised',
                accounts: [],
                instructions: []
            },
            programId,
            provider
        );

        return new PythVoterWeightPluginClient(dummyProgram, pythClient);
    }
}