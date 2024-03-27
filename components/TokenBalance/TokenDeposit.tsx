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
import VanillaVotingPower from '@components/GovernancePower/Power/Vanilla/VanillaVotingPower'
import { DepositTokensButton } from '@components/DepositTokensButton'
import VanillaWithdrawTokensButton from './VanillaWithdrawTokensButton'
import Button from '@components/Button'
import { useJoinRealm } from '@hooks/useJoinRealm'
import { Transaction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import { useConnection } from '@solana/wallet-adapter-react'

/** deposit + withdraw for vanilla govtokens, used only in account view. plugin views still use this for council. */
export const TokenDeposit = ({
  mint,
  tokenRole,
  inAccountDetails,
  setHasGovPower,
  hideVotes,
}: {
  mint: MintInfo | undefined
  tokenRole: GoverningTokenRole
  inAccountDetails?: boolean
  setHasGovPower?: (hasGovPower: boolean) => void
  hideVotes?: boolean
}) => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const {
    userNeedsTokenOwnerRecord,
    userNeedsVoterWeightRecords,
    handleRegister,
  } = useJoinRealm()
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const { connection } = useConnection()

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

  const join = async () => {
    const instructions = await handleRegister()
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction: transaction,
      wallet: wallet!,
      connection,
      signers: [],
      sendingMessage: `Registering`,
      successMessage: `Registered`,
    })
  }

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

  // There are two buttons available on this UI:
  // The Deposit button - available if you have tokens to deposit
  // The Join button - available if you have already deposited tokens (you have a Token Owner Record)
  // but you may not have all your Voter Weight Records yet.
  // This latter case may occur if the DAO changes its configuration and new Voter Weight Records are required.
  // For example if a new plugin is added.
  const showJoinButton =
    !userNeedsTokenOwnerRecord && userNeedsVoterWeightRecords

  // Do not show deposits for mints with zero supply because nobody can deposit anyway
  if (!mint || mint.supply.isZero()) {
    return null
  }

  return (
    <div className="w-full">
      {(availableTokens != '0' || inAccountDetails) && !hideVotes && (
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
        {connected && showJoinButton ? (
          <Button className="w-full" onClick={join}>
            Update
          </Button>
        ) : hasTokensInWallet || inAccountDetails ? (
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
