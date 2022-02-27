import PreviousRouteBtn from '@components/PreviousRouteBtn'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
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
          <div>name: {realmAccount?.name}</div>
          <div>pubKey: {realm?.pubkey.toBase58()}</div>
          <div>authority: {realmAccount?.authority?.toBase58()}</div>
          <div>Owner: {realm?.owner.toBase58()}</div>
          <div>Voting proposals count: {realmAccount?.votingProposalCount}</div>
          {communityMint && <div>Community mint: {communityMint}</div>}
          {councilmint && <div>Council mint: {councilmint}</div>}
          <div className="py-5 pl-10 pr-5">
            <h3>Config</h3>
            {communityMintMaxVoteWeightSource && (
              <div>
                Community mint max vote weight source:{' '}
                {communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage()}
                %
              </div>
            )}
            <div>
              Min community tokens to create governance:{' '}
              {realmConfig &&
                fmtMintAmount(
                  mint,
                  realmConfig!.minCommunityTokensToCreateGovernance
                )}
            </div>
            <div>
              Use community voter weight addin:
              {getYesNoString(realmConfig?.useCommunityVoterWeightAddin)}
            </div>
            <div>
              Use max community voter weight addin:
              {getYesNoString(realmConfig?.useMaxCommunityVoterWeightAddin)}
            </div>
          </div>
        </div>
        <div className="pb-5 pl-10 pr-5">
          <h2>Governances</h2>
          {governedAccounts.map((x) => {
            const pubKey = x.pubkey
            const governanceAccount = x.account
            const governanceConfig = x.account.config
            const accounts = x.accounts
            return (
              <div
                className="mb-3 border border-white border-solid p-5"
                key={pubKey.toBase58()}
              >
                <div>{pubKey.toBase58()}</div>
                <div>owner: {x.owner.toBase58()}</div>
                {realmAccount?.authority?.toBase58() === pubKey.toBase58() && (
                  <div>Realm authority</div>
                )}
                <div>proposals count: {governanceAccount.proposalCount}</div>
                <div>
                  voting proposals count:{' '}
                  {governanceAccount.votingProposalCount}
                </div>
                <div className="p-3">
                  <h3>Config</h3>
                  <div>
                    Max voting time:{' '}
                    {getFormattedStringFromDays(
                      governanceConfig.maxVotingTime / SECS_PER_DAY
                    )}
                  </div>
                  {communityMint && (
                    <div>
                      Min community tokens to create proposal:{' '}
                      {fmtMintAmount(
                        mint,
                        governanceConfig.minCommunityTokensToCreateProposal
                      )}
                    </div>
                  )}
                  {councilmint && (
                    <div>
                      Min council tokens to create proposal:{' '}
                      {fmtMintAmount(
                        councilMint,
                        governanceConfig.minCouncilTokensToCreateProposal
                      )}
                    </div>
                  )}
                  <div>
                    Min instruction holdup time:{' '}
                    {governanceConfig.minInstructionHoldUpTime}
                  </div>
                  <div>
                    Proposal cool off time:{' '}
                    {governanceConfig.proposalCoolOffTime}
                  </div>
                  <div>
                    Vote threshold percentage:{' '}
                    {governanceConfig.voteThresholdPercentage.value}
                  </div>
                  <div>Vote tipping: {governanceConfig.voteTipping}</div>
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
  )
}

export default Params
