import {PublicKey} from "@solana/web3.js";
import {GOVERNANCE_PROGRAM_SEED, VoterWeightAction} from "@solana/spl-governance";
import {DEFAULT_GOVERNANCE_PROGRAM_ID} from "@solana/governance-program-library";
import {UpdateVoterWeightRecordTypes} from "@utils/uiTypes/VotePlugin";

export const reduceAsync = async <TElem, TOut = TElem>(
    arr: TElem[],
    reducer: (
        acc: Awaited<TOut>,
        item: TElem
    ) => Promise<TOut>,
    initialValue: TOut
): Promise<TOut> =>
    arr.reduce(async (acc, item) => reducer(await acc, item), Promise.resolve(initialValue))

type PublicKeyMap = {
    [key: string]: PublicKey | undefined;
}

/**
 * Used to cache react-query responses.
 * Convert to strings to avoid object equality issues.
 * @param args
 */
export const queryKeys = (args: PublicKeyMap) =>
    Object.values(args)
        .filter((value): value is PublicKey => value !== undefined)
        .map((value) => value.toString())

// A synchronous version of the getTokenOwnerRecordAddress function in @solana/spl-governance
// More convenient to use in hooks
export const getTokenOwnerRecordAddressSync = (realm: PublicKey, mint: PublicKey, voter: PublicKey, programId = DEFAULT_GOVERNANCE_PROGRAM_ID) =>
    PublicKey.findProgramAddressSync([
        Buffer.from(GOVERNANCE_PROGRAM_SEED),
        realm.toBuffer(),
        mint.toBuffer(),
        voter.toBuffer(),
    ], programId)


export function convertVoterWeightActionToType(action: VoterWeightAction): UpdateVoterWeightRecordTypes {
    switch (action) {
        case VoterWeightAction.CastVote: return "castVote";
        case VoterWeightAction.CommentProposal: return "commentProposal";
        case VoterWeightAction.CreateGovernance: return "createGovernance";
        case VoterWeightAction.CreateProposal: return "createProposal";
        case VoterWeightAction.SignOffProposal: return "signOffProposal";
    }
}

export const convertTypeToVoterWeightAction = (type: UpdateVoterWeightRecordTypes): VoterWeightAction => {
    switch (type) {
        case "castVote": return VoterWeightAction.CastVote;
        case "commentProposal": return VoterWeightAction.CommentProposal;
        case "createGovernance": return VoterWeightAction.CreateGovernance;
        case "createProposal": return VoterWeightAction.CreateProposal;
        case "signOffProposal": return VoterWeightAction.SignOffProposal;
    }
}