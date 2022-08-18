import { BigNumber } from 'bignumber.js'
import { MintInfo } from '@solana/spl-token'

import { AssetAccount } from '@utils/uiTypes/assets'
import { Wallet } from '@models/treasury/Wallet'

export function getRulesFromAccount(
  account: AssetAccount,
  existingRules: Wallet['rules'],
  councilMint?: MintInfo,
  communityMint?: MintInfo
) {
  const govConfig = account.governance.account.config
  const rules = { ...existingRules }

  if (!rules.common) {
    rules.common = {
      maxVotingTime: govConfig.maxVotingTime,
      minInstructionHoldupTime: govConfig.minInstructionHoldUpTime,
      voteThresholdPercentage: govConfig.communityVoteThreshold.value!,
      voteTipping: govConfig.voteTipping,
    }
  }

  if (
    !govConfig.minCommunityTokensToCreateProposal.isZero() &&
    communityMint &&
    !rules.community
  ) {
    rules.community = {
      decimals: communityMint?.decimals,
      minTokensToCreateProposal: new BigNumber(
        govConfig.minCommunityTokensToCreateProposal.toString()
      ).shiftedBy(communityMint ? -communityMint.decimals : 0),
    }
  }

  if (
    !govConfig.minCouncilTokensToCreateProposal.isZero() &&
    councilMint &&
    !rules.council
  ) {
    rules.council = {
      decimals: councilMint?.decimals,
      minTokensToCreateProposal: new BigNumber(
        govConfig.minCouncilTokensToCreateProposal.toString()
      ).shiftedBy(councilMint ? -councilMint.decimals : 0),
    }
  }

  return rules
}
