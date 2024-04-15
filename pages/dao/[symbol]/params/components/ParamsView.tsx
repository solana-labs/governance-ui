import { fmtMintAmount, getHoursFromTimestamp } from '@tools/sdk/units'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import { getFormattedStringFromDays, SECS_PER_DAY } from '@utils/dateTools'
import Button from '@components/Button'
import { VoteTipping } from '@solana/spl-governance'
import { AddressField, NumberField } from '../index'
import useProgramVersion from '@hooks/useProgramVersion'
import { useRouter } from 'next/router'
import useQueryContext from '@hooks/useQueryContext'
import { useRealmQuery } from '@hooks/queries/realm'
import { DEFAULT_GOVERNANCE_PROGRAM_VERSION } from '@components/instructions/tools'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import { useLegacyVoterWeight } from '@hooks/queries/governancePower'

const ParamsView = ({ activeGovernance }) => {
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const { result: ownVoterWeight } = useLegacyVoterWeight()
  const programVersion = useProgramVersion()
  const realmAccount = realm?.account
  const communityMint = realmAccount?.communityMint.toBase58()
  const router = useRouter()
  const { symbol } = router.query
  const { fmtUrlWithCluster } = useQueryContext()

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

  const minCouncilTokensToCreateProposal = activeGovernance?.account?.config
    ?.minCouncilTokensToCreateProposal
    ? mint &&
      DISABLED_VOTER_WEIGHT.eq(
        activeGovernance.account.config.minCouncilTokensToCreateProposal
      )
      ? 'Disabled'
      : fmtMintAmount(
          mint,
          activeGovernance?.account?.config?.minCouncilTokensToCreateProposal
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
              activeGovernance.account.config.baseVotingTime / SECS_PER_DAY
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
              val={minCouncilTokensToCreateProposal}
            />
          )}
          <NumberField
            label="Min Instruction Holdup Time"
            padding
            val={activeGovernance.account.config.minInstructionHoldUpTime}
          />
          {(programVersion ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION) >= 3 && (
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
          {(programVersion ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION) >= 3 ? (
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
                ownVoterWeight === undefined ||
                !ownVoterWeight.canCreateProposal(
                  activeGovernance.account.config
                )
              }
              tooltipMessage={
                'Please connect wallet with enough voting power to create governance config proposals'
              }
              onClick={() => {
                if (
                  ownVoterWeight?.canCreateProposal(
                    activeGovernance.account.config
                  )
                ) {
                  router.push(
                    fmtUrlWithCluster(
                      `/dao/${symbol}/treasury/governance/${activeGovernance.pubkey.toString()}/edit`
                    )
                  )
                }
              }}
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
