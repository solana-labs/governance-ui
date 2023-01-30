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
      votingCoolOffSeconds: govConfig.votingCoolOffTime,
    }
  }

  if (
    !govConfig.minCommunityTokensToCreateProposal.isZero() &&
    communityMint &&
    !rules.community
  ) {
    rules.community = {
      voteTipping: govConfig.communityVoteTipping,
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
      voteTipping: govConfig.councilVoteTipping,
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
