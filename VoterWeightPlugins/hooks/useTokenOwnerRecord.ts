import {UseVoterWeightPluginsArgs} from "../lib/types";
import {useUserCommunityTokenOwnerRecord, useUserCouncilTokenOwnerRecord} from "@hooks/queries/tokenOwnerRecord";
import {TokenOwnerRecord, ProgramAccount} from "@solana/spl-governance";

export const useTokenOwnerRecord = (
    args: UseVoterWeightPluginsArgs
): ProgramAccount<TokenOwnerRecord> | undefined => {
    const communityTokenOwnerRecord = useUserCommunityTokenOwnerRecord().data?.result
    const councilTokenOwnerRecord = useUserCouncilTokenOwnerRecord().data?.result
    // default to the community token owner record if there is no governance mint specified
    return !args.governanceMintPublicKey
        || communityTokenOwnerRecord?.account.governingTokenMint.equals(args.governanceMintPublicKey)
        ? communityTokenOwnerRecord : councilTokenOwnerRecord
}