import {Client} from "@solana/governance-program-library";
import {PublicKey, TransactionInstruction} from "@solana/web3.js";
import BN from "bn.js";
import {Program, Provider} from "@coral-xyz/anchor";
import {getVotingNfts} from "@hooks/queries/plugins/nftVoter";
import {ON_NFT_VOTER_V2} from "@constants/flags";
import {
    getUpdateVoterWeightRecordInstruction,
    getUpdateVoterWeightRecordInstructionV2
} from "@utils/instructions/NftVoter/updateVoterWeight";
import {IDL, NftVoter} from "../../idls/nft_voter";
import {NftVoterV2} from "../../idls/nft_voter_v2";
import {VoterWeightAction} from "@solana/spl-governance";
import {UpdateVoterWeightRecordTypes} from "@utils/uiTypes/VotePlugin";

function convertVoterWeightActionToType(action: VoterWeightAction): UpdateVoterWeightRecordTypes {
    switch (action) {
        case VoterWeightAction.CastVote: return "castVote";
        case VoterWeightAction.CommentProposal: return "commentProposal";
        case VoterWeightAction.CreateGovernance: return "createGovernance";
        case VoterWeightAction.CreateProposal: return "createProposal";
        case VoterWeightAction.SignOffProposal: return "signOffProposal";
    }
}

export class NftVoterWeightPluginClient extends Client<any> {

    // NO-OP TODO: Double-check
    async createVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    // NO-OP
    async createMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }

    async updateVoterWeightRecord(voter: PublicKey, realm: PublicKey, mint: PublicKey, action: VoterWeightAction): Promise<TransactionInstruction> {
        const { registrar } = this.getRegistrarPDA(realm, mint);
        const { voterWeightPk} = this.getVoterWeightRecordPDA(
            realm,
            mint,
            voter
        )

        const votingNfts = await getVotingNfts(
            this.program.provider.connection,
            realm,
            voter
        )

        if (!ON_NFT_VOTER_V2) {
            console.log('on nft voter v1')
            return getUpdateVoterWeightRecordInstruction(
                this.program as Program<NftVoter>,
                voter,
                registrar,
                voterWeightPk,
                votingNfts,
                convertVoterWeightActionToType(action)
            )
        } else {
            console.log('on nft voter v2')
            const {
                updateVoterWeightRecordIx,
            } = await getUpdateVoterWeightRecordInstructionV2(
                this.program as Program<NftVoterV2>,
                voter,
                registrar,
                voterWeightPk,
                votingNfts,
                convertVoterWeightActionToType(action)
            )
            return updateVoterWeightRecordIx;
        }
    }
    // NO-OP
    async updateMaxVoterWeightRecord(): Promise<TransactionInstruction | null> {
        return null;
    }
    async calculateVoterWeight(voter: PublicKey, realm: PublicKey, mint: PublicKey): Promise<BN | null> {
    }

    constructor(program: Program<NftVoter>, devnet:boolean) {
        super(program, devnet);
    }

    static async connect(provider: Provider, pluginId: PublicKey, devnet = false): Promise<NftVoterWeightPluginClient> {
        return new NftVoterWeightPluginClient(
            new Program<NftVoter>(IDL, pluginId, provider),
            devnet
        );
    }
}