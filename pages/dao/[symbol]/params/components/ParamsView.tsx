import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import {
  getFormattedStringFromDays,
  SECS_PER_DAY,
} from 'VoteStakeRegistry/tools/dateTools'
import Button from '@components/Button'
import { VoteTipping } from '@solana/spl-governance'
import { AddressField, NumberField } from '../index'

const ParamsView = ({ activeGovernance, openGovernanceProposalModal }) => {
  const { realm, mint, councilMint, ownVoterWeight } = useRealm()

  const realmAccount = realm?.account
  const communityMint = realmAccount?.communityMint.toBase58()

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
              val={fmtMintAmount(
                mint,
                activeGovernance.account.config
                  .minCommunityTokensToCreateProposal
              )}
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
          {/* NOT NEEDED RIGHT NOW */}
          {/* <AddressField
          label="Proposal Cool-off Time"
          padding
          val={activeGovernance.account.config.proposalCoolOffTime}
          /> */}
          <AddressField
            label="Vote Threshold Percentage"
            padding
            val={`${activeGovernance.account.config.voteThresholdPercentage.value}%`}
          />
          <AddressField
            label="Vote Tipping"
            padding
            val={
              VoteTipping[activeGovernance.account.config.voteTipping as any]
            }
          />
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
