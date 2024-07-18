import { MintInfo } from '@solana/spl-token'
import BN from 'bn.js'
import { GoverningTokenType } from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import { useEffect } from 'react'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { useRealmCommunityMintInfoQuery, useRealmCouncilMintInfoQuery } from '@hooks/queries/mintInfo'
import ParclVotingPower from './ParclVotingPower'
import { useUserTokenAccountsQuery } from '@hooks/queries/tokenAccount'
import { useRealmQuery } from '@hooks/queries/realm'
import { PublicKey } from '@solana/web3.js'
import VanillaWithdrawTokensButton from '@components/TokenBalance/VanillaWithdrawTokensButton'
import { Deposit } from '@components/GovernancePower/Power/Vanilla/Deposit'

export const PARCL_INSTRUCTIONS =
  'You can deposit PRCL tokens at https://app.parcl.co/staking'
  
const TokenDeposit = ({
  mintInfo,
  mintAddress,
  inAccountDetails,
  setHasGovPower,
  role
}: {
  mintInfo: MintInfo | undefined,
  mintAddress: PublicKey,
  inAccountDetails?: boolean,
  role: 'council' | 'community',
  setHasGovPower?: (hasGovPower: boolean) => void
}) => {
  const wallet = useWalletOnePointOh()
  const { data: tokenAccounts } = useUserTokenAccountsQuery()
  const connected = !!wallet?.connected

  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const config = useRealmConfigQuery().data?.result

  const relevantTokenConfig = role === "community"
    ? config?.account.communityTokenConfig
    : config?.account.councilTokenConfig;

  const isMembership =
    relevantTokenConfig?.tokenType === GoverningTokenType.Membership
  const isDormant =  
    relevantTokenConfig?.tokenType === GoverningTokenType.Dormant;

  const depositTokenRecord = ownTokenRecord
  const depositTokenAccount = tokenAccounts?.find((a) =>
    a.account.mint.equals(mintAddress)
  );
  
  const hasTokensInWallet =
    depositTokenAccount && depositTokenAccount.account.amount.gt(new BN(0))

  const hasTokensDeposited =
    depositTokenRecord &&
    depositTokenRecord.account.governingTokenDepositAmount.gt(new BN(0))

  const availableTokens =
    depositTokenRecord && mintInfo
      ? fmtMintAmount(
        mintInfo,
          depositTokenRecord.account.governingTokenDepositAmount
        )
      : '0'

  useEffect(() => {
    if (availableTokens != '0' || hasTokensDeposited || hasTokensInWallet) {
      if (setHasGovPower) setHasGovPower(true)
    }
  }, [availableTokens, hasTokensDeposited, hasTokensInWallet, setHasGovPower])

  const canShowAvailableTokensMessage = hasTokensInWallet && connected
  const tokensToShow =
    hasTokensInWallet && depositTokenAccount
      ? fmtMintAmount(mintInfo, depositTokenAccount.account.amount)
      : hasTokensInWallet
      ? availableTokens
      : 0

  // Do not show deposits for mints with zero supply because nobody can deposit anyway
  if (!mintInfo || mintInfo.supply.isZero()) {
    return null
  }

  return (
    <div className="w-full">
      {(availableTokens != '0' || inAccountDetails) && (
        <div className="flex items-center space-x-4">
          <ParclVotingPower className="w-full" role={role} />
        </div>
      )}
      <div
        className={`my-4 opacity-70 text-xs  ${
          canShowAvailableTokensMessage ? 'block' : 'hidden'
        }`}
      >
        You have {tokensToShow} {hasTokensDeposited ? `more ` : ``} tokens
        available to deposit.
      </div>
      {
        role === "community" 
        ? <div className={`my-4 opacity-70 text-xs`}>{PARCL_INSTRUCTIONS}</div>
        : null
      }
      {
        !isDormant
        ? <Deposit role="council" />
        : null
      }      
      <div className="flex flex-col mt-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                {!isMembership && // Membership tokens can't be withdrawn (that is their whole point, actually)
                  !isDormant &&
                    inAccountDetails && (
                        <VanillaWithdrawTokensButton
                            role={
                                'council'
                            }
                        />
                    )}
      </div>
    </div>
  )
}

const ParclAccountDetails = () => {
  const realm = useRealmQuery().data?.result
  const communityMint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result;
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const councilMintAddress = realm?.account.config.councilMint;
  const hasLoaded = communityMint && councilMint && realm && councilMintAddress;

  return (
    <>
      {hasLoaded ? (
        <div className={`${`flex flex-col w-full`}`}>
          {!connected ? (
              <div className={'text-xs text-white/50 mt-8'}>
                Connect your wallet to see governance power
              </div>
            ) : 
            (
            <>
              <TokenDeposit mintInfo={communityMint} mintAddress={realm.account.communityMint} role={"community"} inAccountDetails={true} />
              <TokenDeposit mintInfo={councilMint} mintAddress={councilMintAddress} role={"council"} inAccountDetails={true} />
            </>
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

export default ParclAccountDetails
