import PreviousRouteBtn from '@components/PreviousRouteBtn'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'

const Params = () => {
  const { realm, mint } = useRealm()
  const governancesArray = useGovernanceAssetsStore((s) => s.governancesArray)
  const realmAccount = realm?.account
  const communityMint = realmAccount?.communityMint.toBase58()
  const councilmint = realmAccount?.config.councilMint
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
              {fmtMintAmount(
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
          {governancesArray.map((x) => (
            <div
              className="mb-3 border border-white border-solid p-5"
              key={x.pubkey.toBase58()}
            >
              <div>{x.pubkey.toBase58()}</div>
              <div>owner: {x.owner.toBase58()}</div>
              {realmAccount?.authority?.toBase58() === x.pubkey.toBase58() && (
                <div>Realm authority</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Params
