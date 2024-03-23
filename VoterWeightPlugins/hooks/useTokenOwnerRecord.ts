import {useUserCommunityTokenOwnerRecord, useUserCouncilTokenOwnerRecord} from "@hooks/queries/tokenOwnerRecord";
import {TokenOwnerRecord, ProgramAccount} from "@solana/spl-governance";
import {PublicKey} from "@solana/web3.js";

export const useTokenOwnerRecord = (
    governanceMintPublicKey?: PublicKey
): ProgramAccount<TokenOwnerRecord> | undefined => {
    const communityTokenOwnerRecord = useUserCommunityTokenOwnerRecord().data?.result
    const councilTokenOwnerRecord = useUserCouncilTokenOwnerRecord().data?.result

    // default to the community token owner record if there is no governance mint specified
    if (!governanceMintPublicKey) return communityTokenOwnerRecord;

    if (councilTokenOwnerRecord?.account.governingTokenMint.equals(governanceMintPublicKey)) {
        return councilTokenOwnerRecord;
    }

    if (communityTokenOwnerRecord?.account.governingTokenMint.equals(governanceMintPublicKey)) {
        return communityTokenOwnerRecord;
    }

    return undefined;
}