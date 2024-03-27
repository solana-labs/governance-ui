import { MintInfo } from '@solana/spl-token'
import BN from 'bn.js'
import useRealm from '@hooks/useRealm'
import { GoverningTokenType } from '@solana/spl-governance'
import { GoverningTokenRole } from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import { getMintMetadata } from '../instructions/programs/splToken'
import { useEffect } from 'react'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import VanillaVotingPower from '@components/GovernancePower/Vanilla/VanillaVotingPower'
import { DepositTokensButton } from '@components/DepositTokensButton'
import VanillaWithdrawTokensButton from './VanillaWithdrawTokensButton'

/** deposit + withdraw for vanilla govtokens, used only in account view. plugin views still use this for council. */
export const TokenDeposit = ({
  mint,
  tokenRole,
  inAccountDetails,
  setHasGovPower,
}: {
  mint: MintInfo | undefined
  tokenRole: GoverningTokenRole
  inAccountDetails?: boolean
  setHasGovPower?: (hasGovPower: boolean) => void
}) => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result

  const relevantTokenConfig =
    tokenRole === GoverningTokenRole.Community
      ? config?.account.communityTokenConfig
      : config?.account.councilTokenConfig
  const isMembership =
    relevantTokenConfig?.tokenType === GoverningTokenType.Membership

  const { realmTokenAccount, councilTokenAccount } = useRealm()

  const depositTokenRecord =
    tokenRole === GoverningTokenRole.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord

  const depositTokenAccount =
    tokenRole === GoverningTokenRole.Community
      ? realmTokenAccount
      : councilTokenAccount

  const depositMint =
    tokenRole === GoverningTokenRole.Community
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const tokenName = getMintMetadata(depositMint)?.name ?? realm?.account.name

  const depositTokenName = `${tokenName} ${
    tokenRole === GoverningTokenRole.Community ? '' : 'Council'
  }`

  const hasTokensInWallet =
    depositTokenAccount && depositTokenAccount.account.amount.gt(new BN(0))

  const hasTokensDeposited =
    depositTokenRecord &&
    depositTokenRecord.account.governingTokenDepositAmount.gt(new BN(0))

  const availableTokens =
    depositTokenRecord && mint
      ? fmtMintAmount(
          mint,
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
      ? fmtMintAmount(mint, depositTokenAccount.account.amount)
      : hasTokensInWallet
      ? availableTokens
      : 0

  // Do not show deposits for mints with zero supply because nobody can deposit anyway
  if (!mint || mint.supply.isZero()) {
    return null
  }

  return (
    <div className="w-full">
      {(availableTokens != '0' || inAccountDetails) && (
        <div className="flex items-center space-x-4">
          {tokenRole === GoverningTokenRole.Community ? (
            <VanillaVotingPower className="w-full" role="community" />
          ) : (
            <VanillaVotingPower className="w-full" role="council" />
          )}
        </div>
      )}

      <div
        className={`my-4 opacity-70 text-xs  ${
          canShowAvailableTokensMessage ? 'block' : 'hidden'
        }`}
      >
        You have {tokensToShow} {hasTokensDeposited ? `more ` : ``}
        {depositTokenName} tokens available to deposit.
      </div>

      <div className="flex flex-col mt-6 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        {hasTokensInWallet || inAccountDetails ? (
          <DepositTokensButton
            className="sm:w-1/2 max-w-[200px]"
            role={
              tokenRole === GoverningTokenRole.Community
                ? 'community'
                : 'council'
            }
            as={inAccountDetails ? 'primary' : 'secondary'}
          />
        ) : null}
        {!isMembership && // Membership tokens can't be withdrawn (that is their whole point, actually)
          inAccountDetails && (
            <VanillaWithdrawTokensButton
              role={
                tokenRole === GoverningTokenRole.Community
                  ? 'community'
                  : 'council'
              }
            />
          )}
      </div>
    </div>
  )
}
