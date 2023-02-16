import useRealm from '@hooks/useRealm'
import { fmtMintAmount, getHoursFromTimestamp } from '@tools/sdk/units'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import {
  getFormattedStringFromDays,
  SECS_PER_DAY,
} from 'VoteStakeRegistry/tools/dateTools'
import Button from '@components/Button'
import { VoteTipping } from '@solana/spl-governance'
import { AddressField, NumberField } from '../index'
import useProgramVersion from '@hooks/useProgramVersion'

const ParamsView = ({ activeGovernance, openGovernanceProposalModal }) => {
  const { realm, mint, councilMint, ownVoterWeight } = useRealm()
  const programVersion = useProgramVersion()
  const realmAccount = realm?.account
  const communityMint = realmAccount?.communityMint.toBase58()

  const minCommunityTokensToCreateProposal = activeGovernance?.account?.config
    ?.minCommunityTokensToCreateProposal
    ? mint &&
      DISABLED_VOTER_WEIGHT.eq(
        activeGovernance.account.config.minCommunityTokensToCreateProposal
      )
      ? 'Disabled'
      : fmtMintAmount(
          mint,
          activeGovernance?.account?.config?.minCommunityTokensToCreateProposal
        )
    : 'calculating...'

  return (
    <>
      {activeGovernance && (
        <>
          {realmAccount?.authority?.toBase58() ===
            activeGovernance.pubkey.toBase58() && (
            <AddressField label="Realm Authority" padding val={'Yes'} />
          )}
          <AddressField
            label="Max Voting Time"
            padding
            val={getFormattedStringFromDays(
              activeGovernance.account.config.maxVotingTime / SECS_PER_DAY
            )}
          />
          {communityMint && (
            <AddressField
              label="Min community tokens to create a proposal"
              padding
              val={minCommunityTokensToCreateProposal}
            />
          )}
          {councilMint && (
            <AddressField
              label="Min council tokens to create a proposal"
              padding
              val={fmtMintAmount(
                councilMint,
                activeGovernance.account.config.minCouncilTokensToCreateProposal
              )}
            />
          )}
          <NumberField
            label="Min Instruction Holdup Time"
            padding
            val={activeGovernance.account.config.minInstructionHoldUpTime}
          />
          {programVersion >= 3 && (
            <>
              <AddressField
                label="Proposal Cool-off Time"
                padding
                val={`${getHoursFromTimestamp(
                  activeGovernance.account.config.votingCoolOffTime
                )} hour(s)`}
              />
              <AddressField
                label="Deposit Exempt Proposal Count"
                padding
                val={`${activeGovernance.account.config.depositExemptProposalCount}`}
              />
            </>
          )}
          {activeGovernance.account.config?.communityVoteThreshold?.value && (
            <AddressField
              label="Community Vote Threshold Percentage"
              padding
              val={`${activeGovernance.account.config.communityVoteThreshold.value}%`}
            />
          )}
          {activeGovernance.account.config?.councilVoteThreshold?.value && (
            <AddressField
              label="Council Vote Threshold Percentage"
              padding
              val={`${activeGovernance.account.config.councilVoteThreshold.value}%`}
            />
          )}
          {console.log(activeGovernance.account.config.communityVoteTipping)}
          {programVersion >= 3 ? (
            <>
              <AddressField
                label="Community Vote Tipping"
                padding
                val={
                  VoteTipping[
                    activeGovernance.account.config.communityVoteTipping as any
                  ]
                }
              />
              <AddressField
                label="Council Vote Tipping"
                padding
                val={
                  VoteTipping[
                    activeGovernance.account.config.councilVoteTipping as any
                  ]
                }
              />
            </>
          ) : (
            <AddressField
              label="Vote Tipping"
              padding
              val={
                VoteTipping[activeGovernance.account.config.voteTipping as any]
              }
            />
          )}

          <div className="flex">
            <Button
              disabled={
                !ownVoterWeight.canCreateProposal(
                  activeGovernance.account.config
                )
              }
              tooltipMessage={
                'Please connect wallet with enough voting power to create governance config proposals'
              }
              onClick={openGovernanceProposalModal}
              className="ml-auto"
            >
              Change config
            </Button>
          </div>
        </>
      )}
    </>
  )
}

export default ParamsView
