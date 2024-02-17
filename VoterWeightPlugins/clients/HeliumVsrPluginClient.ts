import {Client, DEFAULT_GOVERNANCE_PROGRAM_ID} from "@solana/governance-program-library";
import {PublicKey, TransactionInstruction} from "@solana/web3.js";
import BN from "bn.js";
import {Provider} from "@coral-xyz/anchor";
import {registrarKey, voterWeightRecordKey} from "@helium/voter-stake-registry-sdk";
import {getAssociatedTokenAddress} from "@blockworks-foundation/mango-v4";
import {HeliumVsrClient} from "../../HeliumVotePlugin/sdk/client";
import {AccountData} from "@utils/uiTypes/VotePlugin";
import {getTokenOwnerRecordAddress, VoterWeightAction} from "@solana/spl-governance";
import {getPositions, GetPositionsReturn} from "../../HeliumVotePlugin/utils/getPositions";

export class HeliumVsrPluginClient extends Client<any> {
    readonly requiresInputVoterWeight = false;

    // NO-OP TODO: Double-check
    async createVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    // NO-OP
    async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    async updateVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey, action: VoterWeightAction) {
        const { positions } = await this.getPositions(voter, realm, mint);
        const tokenOwnerRecord = await getTokenOwnerRecordAddress(this.governanceProgramId, realm, mint, voter);

        const remainingAccounts: AccountData[] = []
        const [registrar] = registrarKey(
            realm,
            mint,
            this.program.programId
        )

        for (const pos of positions) {
            const tokenAccount = await getAssociatedTokenAddress(
                pos.mint,
                voter,
                true
            )

            remainingAccounts.push(
                new AccountData(tokenAccount),
                new AccountData(pos.pubkey)
            )
        }

        const [voterWeightPk] = voterWeightRecordKey(
            registrar,
            voter,
            this.program.programId
        )

        const ix = await this.program.methods
                .updateVoterWeightRecordV0({
                    owner: voter,
                    voterWeightAction: {
                        [action]: {},
                    },
                } as any)
                .accounts({
                    registrar,
                    voterWeightRecord: voterWeightPk,
                    voterTokenOwnerRecord: tokenOwnerRecord,
                })
                .remainingAccounts(remainingAccounts.slice(0, 10))
                .instruction();

        return { pre: [ix] }
    }
    // NO-OP
    async updateMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }
    async calculateVoterWeight(voter: PublicKey, realm: PublicKey, mint: PublicKey): Promise<BN | null> {
        const positionDetails = await this.getPositions(voter, realm, mint);
        return positionDetails.votingPower
    }
    constructor(readonly internalClient: HeliumVsrClient, devnet:boolean, readonly governanceProgramId ) {
        super(internalClient.program, devnet);
    }

    private async getPositions(voter: PublicKey, realm: PublicKey, mint: PublicKey): Promise<GetPositionsReturn> {
        return getPositions({
            realmPk: realm,
            walletPk: voter,
            communityMintPk: mint,
            client: this.internalClient,
            connection: this.program.provider.connection
        })
    }

    static async connect(provider: Provider, pluginId: PublicKey, devnet = false, governanceProgramId = DEFAULT_GOVERNANCE_PROGRAM_ID): Promise<HeliumVsrPluginClient> {
        // used purely to get the current user's vsr positions
        const internalClient = await HeliumVsrClient.connect(provider, pluginId, devnet)

        return new HeliumVsrPluginClient(
            internalClient,
            devnet,
            governanceProgramId
        );
    }
}