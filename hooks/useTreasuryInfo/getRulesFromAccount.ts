import { BigNumber } from 'bignumber.js'
import { MintInfo } from '@solana/spl-token'

import { AssetAccount } from '@utils/uiTypes/assets'
import { Wallet } from '@models/treasury/Wallet'
import { VoteThresholdType } from '@solana/spl-governance'

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
      voteTipping: govConfig.communityVoteTipping,
    }
  }

  if (
    !govConfig.minCommunityTokensToCreateProposal.isZero() &&
    communityMint &&
    !rules.community
  ) {
    rules.community = {
      decimals: communityMint?.decimals,
      voteThresholdPercentage:
        govConfig.communityVoteThreshold.value ?? 'disabled',
      vetoVoteThresholdPercentage:
        govConfig.communityVetoVoteThreshold.value ?? 'disabled',
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
      voteThresholdPercentage:
        govConfig.councilVoteThreshold.value ?? 'disabled',
      vetoVoteThresholdPercentage:
        govConfig.councilVetoVoteThreshold.value ?? 'disabled',
      minTokensToCreateProposal: new BigNumber(
        govConfig.minCouncilTokensToCreateProposal.toString()
      ).shiftedBy(councilMint ? -councilMint.decimals : 0),
    }
  }

  return rules
}
