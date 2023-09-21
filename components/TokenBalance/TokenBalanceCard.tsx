import { MintInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { Proposal } from '@solana/spl-governance'
import { Option } from '@tools/core/option'
import { GoverningTokenRole } from '@solana/spl-governance'
import { useState } from 'react'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import { TokenDeposit } from './TokenDeposit'

const TokenBalanceCard = ({
  proposal,
  inAccountDetails = false,
  children,
}: {
  proposal?: Option<Proposal>
  inAccountDetails?: boolean
  children?: React.ReactNode
}) => {
  const [hasGovPower, setHasGovPower] = useState<boolean>(false)
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const isDepositVisible = (
    depositMint: MintInfo | undefined,
    realmMint: PublicKey | undefined
  ) =>
    depositMint &&
    (!proposal ||
      (proposal.isSome() &&
        proposal.value.governingTokenMint.toBase58() === realmMint?.toBase58()))

  const communityDepositVisible =
    // If there is no council then community deposit is the only option to show
    !realm?.account.config.councilMint ||
    isDepositVisible(mint, realm?.account.communityMint)

  const councilDepositVisible = isDepositVisible(
    councilMint,
    realm?.account.config.councilMint
  )
  const hasLoaded = mint || councilMint

  return (
    <>
      {hasLoaded ? (
        <div
          className={`${
            inAccountDetails ? `flex w-full gap-8 md:gap-12` : `space-y-4`
          }`}
        >
          {!hasGovPower && !inAccountDetails && connected && (
            <div className={'text-xs text-white/50 mt-8'}>
              You do not have any governance power in this dao
            </div>
          )}
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
              inAccountDetails={inAccountDetails}
              setHasGovPower={setHasGovPower}
            />
          )}
          {councilDepositVisible && (
            <TokenDeposit
              mint={councilMint}
              tokenRole={GoverningTokenRole.Council}
              councilVote={true}
              inAccountDetails={inAccountDetails}
              setHasGovPower={setHasGovPower}
            />
          )}
        </div>
      ) : (
        <>
          <div className="h-12 mb-4 rounded-lg animate-pulse bg-bkg-3" />
          <div className="h-10 rounded-lg animate-pulse bg-bkg-3" />
        </>
      )}

      {children}
    </>
  )
}

export default TokenBalanceCard
