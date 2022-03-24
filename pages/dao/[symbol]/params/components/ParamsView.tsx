import { useEffect } from 'react'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import { capitalize } from '@utils/helpers'
import {
  getFormattedStringFromDays,
  SECS_PER_DAY,
} from 'VoteStakeRegistry/tools/dateTools'
import Button from '@components/Button'
import { VoteTipping } from '@solana/spl-governance'

const ParamsView = ({ activeGovernance, openGovernanceProposalModal }) => {
  const { realm, mint, councilMint, ownVoterWeight } = useRealm()

  const realmAccount = realm?.account
  const communityMint = realmAccount?.communityMint.toBase58()

  useEffect(() => {
    console.log(activeGovernance, activeGovernance.pubkey)
  }, [])

  return (
    <>
      {realmAccount?.authority?.toBase58() ===
        activeGovernance.pubkey.toBase58() && (
        <DisplayField label="Realm Authority" padding val={'Yes'} />
      )}
      <DisplayField
        label="Max Voting Time"
        padding
        val={getFormattedStringFromDays(
          activeGovernance.account.config.maxVotingTime / SECS_PER_DAY
        )}
      />
      {communityMint && (
        <DisplayField
          label="Min community tokens to create a proposal"
          padding
          val={fmtMintAmount(
            mint,
            activeGovernance.account.config.minCommunityTokensToCreateProposal
          )}
        />
      )}
      {councilMint && (
        <DisplayField
          label="Min council tokens to create a proposal"
          padding
          val={fmtMintAmount(
            councilMint,
            activeGovernance.account.config.minCouncilTokensToCreateProposal
          )}
        />
      )}
      <DisplayField
        label="Min Instruction Holdup Time"
        padding
        val={activeGovernance.account.config.minInstructionHoldUpTime}
      />
      {/* NOT NEEDED RIGHT NOW */}
      {/* <DisplayField
        label="Proposal Cool-off Time"
        padding
        val={activeGovernance.account.config.proposalCoolOffTime}
        /> */}
      <DisplayField
        label="Vote Threshold Percentage"
        padding
        val={`${activeGovernance.account.config.voteThresholdPercentage.value}%`}
      />
      <DisplayField
        label="Vote Tipping"
        padding
        val={VoteTipping[activeGovernance.account.config.voteTipping as any]}
      />
      <div className="flex">
        <Button
          disabled={
            !ownVoterWeight.canCreateProposal(activeGovernance.account.config)
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
  )
}

const DisplayField = ({ label, val, padding = false, bg = false }) => {
  return (
    <div
      className={`flex flex-col mb-2 ${bg ? 'bg-bkg-1' : ''} ${
        padding ? 'py-1' : ''
      }`}
    >
      <div className="text-xs text-fgd-3">{capitalize(label)}</div>
      <div className="text-sm break-all">{val}</div>
    </div>
  )
}

export default ParamsView
