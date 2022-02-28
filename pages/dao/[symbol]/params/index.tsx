import PreviousRouteBtn from '@components/PreviousRouteBtn'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import { capitalize } from '@utils/helpers'
import tokenService from '@utils/services/token'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import {
  getFormattedStringFromDays,
  SECS_PER_DAY,
} from 'VoteStakeRegistry/tools/dateTools'

const Params = () => {
  const { realm, mint, councilMint } = useRealm()
  const governedAccounts = useGovernanceAssetsStore((s) => s.governedAccounts)
  const realmAccount = realm?.account
  const communityMint = realmAccount?.communityMint.toBase58()
  const councilmint = realmAccount?.config.councilMint?.toBase58()
  const communityMintMaxVoteWeightSource =
    realmAccount?.config.communityMintMaxVoteWeightSource
  const realmConfig = realmAccount?.config
  const getYesNoString = (val) => {
    return val ? ' Yes' : ' No'
  }
  return (
    <div className="grid grid-cols-12">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 space-y-3">
        <div className="flex flex-row items-center">
          <PreviousRouteBtn />
          <h1 className="ml-3">Parameters</h1>
        </div>
        <div>
          <h2>Realm</h2>
          <DisplayField label="name" val={realmAccount?.name}></DisplayField>
          <DisplayField
            label="pubkey"
            val={realm?.pubkey.toBase58()}
          ></DisplayField>
          <DisplayField
            label="authority"
            val={realmAccount?.authority?.toBase58()}
          ></DisplayField>
          <DisplayField
            label="owner"
            val={realm?.owner.toBase58()}
          ></DisplayField>
          <DisplayField
            label="voting proposals count"
            val={realmAccount?.votingProposalCount}
          ></DisplayField>
          {communityMint && (
            <DisplayField
              label="Community mint"
              val={communityMint}
            ></DisplayField>
          )}
          {councilmint && (
            <DisplayField label="Council mint" val={councilmint}></DisplayField>
          )}
          <div className="py-5">
            <h3>Config</h3>
            {communityMintMaxVoteWeightSource && (
              <DisplayField
                label="Community mint max vote weight source"
                val={`${communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage()}
              %`}
              ></DisplayField>
            )}
            <DisplayField
              label="Min community tokens to create governance"
              val={
                realmConfig &&
                fmtMintAmount(
                  mint,
                  realmConfig!.minCommunityTokensToCreateGovernance
                )
              }
            ></DisplayField>
            <DisplayField
              label="Use community voter weight addin"
              val={getYesNoString(realmConfig?.useCommunityVoterWeightAddin)}
            ></DisplayField>
            <DisplayField
              label="Use max community voter weight addin"
              val={getYesNoString(realmConfig?.useMaxCommunityVoterWeightAddin)}
            ></DisplayField>
          </div>
        </div>
        <div className="pb-5 pl-10 pr-5">
          <h2>Governances</h2>
          <div className="grid grid-cols-12 space-x-4">
            {governedAccounts.map((x) => {
              const pubKey = x.pubkey
              const governanceAccount = x.account
              const governanceConfig = x.account.config
              const accounts = x.accounts
              return (
                <div
                  className="border p-5 border-fgd-4 default-transition rounded-lg css-1tv4gvt-StyledCardWrapper elzt7lo0 col-span-6 mb-4"
                  key={pubKey.toBase58()}
                >
                  <DisplayField
                    label="Pubkey"
                    val={pubKey.toBase58()}
                  ></DisplayField>
                  <DisplayField
                    label="owner"
                    val={x.owner.toBase58()}
                  ></DisplayField>
                  {realmAccount?.authority?.toBase58() ===
                    pubKey.toBase58() && (
                    <DisplayField
                      label="realm authority"
                      val={'Yes'}
                    ></DisplayField>
                  )}
                  <DisplayField
                    label="proposals count"
                    val={governanceAccount.proposalCount}
                  ></DisplayField>
                  <DisplayField
                    label=" voting proposals count"
                    val={governanceAccount.votingProposalCount}
                  ></DisplayField>
                  <div>
                    <h3>Config</h3>
                    <DisplayField
                      label=" Max voting time"
                      val={getFormattedStringFromDays(
                        governanceConfig.maxVotingTime / SECS_PER_DAY
                      )}
                    ></DisplayField>
                    {communityMint && (
                      <DisplayField
                        label="Min community tokens to create proposal"
                        val={fmtMintAmount(
                          mint,
                          governanceConfig.minCommunityTokensToCreateProposal
                        )}
                      ></DisplayField>
                    )}
                    {councilmint && (
                      <DisplayField
                        label="Min council tokens to create proposal"
                        val={governanceConfig.minCouncilTokensToCreateProposal}
                      ></DisplayField>
                    )}
                    <DisplayField
                      label="Min instruction holdup time"
                      val={governanceConfig.minInstructionHoldUpTime}
                    ></DisplayField>
                    <DisplayField
                      label="Proposal cool off time"
                      val={governanceConfig.proposalCoolOffTime}
                    ></DisplayField>
                    <DisplayField
                      label="Vote threshold percentage"
                      val={governanceConfig.voteThresholdPercentage.value}
                    ></DisplayField>
                    <DisplayField
                      label="Vote tipping"
                      val={governanceConfig.voteTipping}
                    ></DisplayField>
                  </div>
                  <div className="p-3">
                    <h3>Accounts</h3>
                    {accounts.map((x) => (
                      <div key={x.pubkey.toBase58()}>
                        <div>Pubkey: {x.pubkey.toBase58()}</div>
                        <div>Amount: {x.account.amount.toNumber()}</div>
                        <div>
                          Name:{' '}
                          {tokenService.getTokenInfo(x.account.mint.toBase58())
                            ?.name || x.account.mint.toBase58()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const DisplayField = ({ label, val }) => {
  return (
    <div className="flex items-center mb-2">
      <div className="mr-2">{capitalize(label)}:</div>
      <div className="text-fgd-3 break-all">{val}</div>
    </div>
  )
}

export default Params
