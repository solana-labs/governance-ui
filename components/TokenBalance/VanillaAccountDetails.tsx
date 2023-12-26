import { GoverningTokenRole } from '@solana/spl-governance'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import { TokenDeposit } from './TokenDeposit'

const VanillaAccountDetails = () => {
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const communityDepositVisible =
    // If there is no council then community deposit is the only option to show
    !realm?.account.config.councilMint ||
    realm?.account.communityMint !== undefined
  const councilDepositVisible = realm?.account.config.councilMint !== undefined
  const hasLoaded = mint || councilMint

  return (
    <>
      {hasLoaded ? (
        <div className={`${`flex w-full gap-8 md:gap-12`}`}>
          {!connected && (
            <div className={'text-xs text-white/50 mt-8'}>
              Connect your wallet to see governance power
            </div>
          )}
          {communityDepositVisible && (
            <TokenDeposit
              mint={mint}
              tokenRole={GoverningTokenRole.Community}
              councilVote={false}
              inAccountDetails={true}
            />
          )}
          {councilDepositVisible && (
            <TokenDeposit
              mint={councilMint}
              tokenRole={GoverningTokenRole.Council}
              councilVote={true}
              inAccountDetails={true}
            />
          )}
        </div>
      ) : (
        <>
          <div className="h-12 mb-4 rounded-lg animate-pulse bg-bkg-3" />
          <div className="h-10 rounded-lg animate-pulse bg-bkg-3" />
        </>
      )}
    </>
  )
}

export default VanillaAccountDetails
