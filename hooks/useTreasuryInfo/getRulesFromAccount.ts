import { BigNumber } from 'bignumber.js'
import { MintInfo } from '@solana/spl-token'

import { AssetAccount } from '@utils/uiTypes/assets'
import { Wallet } from '@models/treasury/Wallet'

export function getRulesFromAccount(
  account: AssetAccount,
  existingRules: Wallet['rules'],
  councilMintAddress?: string,
  communityMintAddress?: string,
  councilMint?: MintInfo,
  communityMint?: MintInfo
) {
  const govConfig = account.governance.account.config
  const rules = { ...existingRules }

  if (
    !govConfig.minCommunityTokensToCreateProposal.isZero() &&
    !rules.community
  ) {
    rules.community = {
      address: communityMintAddress,
      maxVotingTime: govConfig.maxVotingTime,
      minInstructionHoldupTime: govConfig.minInstructionHoldUpTime,
      minTokensToCreateProposal: new BigNumber(
        govConfig.minCommunityTokensToCreateProposal.toString()
      ).shiftedBy(communityMint ? -communityMint.decimals : 0),
      voteThresholdPercentage: govConfig.voteThresholdPercentage.value,
      voteTipping: govConfig.voteTipping,
    }
  }

  if (!govConfig.minCouncilTokensToCreateProposal.isZero() && !rules.council) {
    rules.council = {
      address: councilMintAddress,
      maxVotingTime: govConfig.maxVotingTime,
      minInstructionHoldupTime: govConfig.minInstructionHoldUpTime,
      minTokensToCreateProposal: new BigNumber(
        govConfig.minCouncilTokensToCreateProposal.toString()
      ).shiftedBy(councilMint ? -councilMint.decimals : 0),
      voteThresholdPercentage: govConfig.voteThresholdPercentage.value,
      voteTipping: govConfig.voteTipping,
    }
  }

  return rules
}
