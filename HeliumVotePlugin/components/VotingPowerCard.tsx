import React, { useEffect, useState } from 'react'
import { BN } from '@coral-xyz/anchor'
import { GoverningTokenRole } from '@solana/spl-governance'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import InlineNotification from '@components/InlineNotification'
import DelegateTokenBalanceCard from '@components/TokenBalance/DelegateTokenBalanceCard'
import { TokenDeposit } from '@components/TokenBalance/TokenBalanceCard'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'
import { MintInfo } from '@solana/spl-token'
import { VotingPowerBox } from './VotingPowerBox'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'

export const VotingPowerCard: React.FC<{
  inAccountDetails?: boolean
}> = ({ inAccountDetails }) => {
  const loading = useHeliumVsrStore((s) => s.state.isLoading)
  const [hasGovPower, setHasGovPower] = useState(false)
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const councilDepositVisible = !!councilMint

  const isLoading = !mint || !councilMint || loading
  const isSameWallet =
    (connected && !ownTokenRecord) ||
    (connected &&
      ownTokenRecord &&
      wallet!.publicKey!.equals(ownTokenRecord!.account.governingTokenOwner))

  return (
    <>
      {!isLoading ? (
        <>
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
          {connected && (
            <TokenDepositLock
              mint={mint}
              setHasGovPower={setHasGovPower}
              isSameWallet={isSameWallet!}
            />
          )}
          {councilDepositVisible && (
            <div className="mt-4">
              <TokenDeposit
                mint={councilMint}
                tokenRole={GoverningTokenRole.Council}
                councilVote={true}
                setHasGovPower={setHasGovPower}
              />
            </div>
          )}
          <DelegateTokenBalanceCard />
        </>
      ) : (
        <>
          <div className="animate-pulse bg-bkg-3 h-12 mb-4 rounded-lg" />
          <div className="animate-pulse bg-bkg-3 h-10 rounded-lg" />
        </>
      )}
    </>
  )
}

const TokenDepositLock = ({
  mint,
  setHasGovPower,
  isSameWallet = false,
}: {
  mint: MintInfo | undefined
  setHasGovPower: (hasGovPower: boolean) => void
  isSameWallet: boolean
}) => {
  const realm = useRealmQuery().data?.result
  const { realmTokenAccount } = useRealm()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const [amountLocked, votingPower] = useHeliumVsrStore((s) => [
    s.state.amountLocked,
    s.state.votingPower,
  ])

  const tokenName =
    getMintMetadata(realm?.account.communityMint)?.name ?? realm?.account.name

  const hasTokensInWallet =
    realmTokenAccount && realmTokenAccount.account.amount.gt(new BN(0))

  const availableTokens =
    hasTokensInWallet && mint
      ? fmtMintAmount(mint, realmTokenAccount?.account.amount as BN)
      : '0'

  const lockTokensFmt =
    amountLocked && mint ? fmtMintAmount(mint, amountLocked) : '0'

  useEffect(() => {
    if (
      availableTokens != '0' ||
      amountLocked.gt(new BN(0)) ||
      hasTokensInWallet
    ) {
      setHasGovPower(true)
    } else {
      setHasGovPower(false)
    }
  }, [availableTokens, amountLocked, hasTokensInWallet, setHasGovPower])

  const tokensToShow =
    hasTokensInWallet && realmTokenAccount
      ? fmtMintAmount(mint, realmTokenAccount.account.amount)
      : hasTokensInWallet
      ? availableTokens
      : 0

  if (!mint || mint.supply.isZero()) return null
  return (
    <>
      {isSameWallet && hasTokensInWallet && connected ? (
        <div className="pt-2">
          <InlineNotification
            desc={`You have ${tokensToShow} ${
              amountLocked ? `more` : ``
            } ${tokenName} available to lock.`}
            type="info"
          />
        </div>
      ) : null}
      {votingPower.gt(new BN(0)) && (
        <div className="flex space-x-4 items-center mt-4">
          <VotingPowerBox
            votingPower={votingPower}
            mint={mint}
            votingPowerFromDeposits={amountLocked}
            className="w-full px-4 py-2"
          />
        </div>
      )}
      {amountLocked.gt(new BN(0)) ? (
        <div className="pt-4 px-4">
          {amountLocked.gt(new BN(0)) && (
            <p className="flex text-xs">
              <span>{tokenName} Locked</span>
              <span className="font-bold ml-auto text-fgd-1">
                {lockTokensFmt}
              </span>
            </p>
          )}
        </div>
      ) : null}
    </>
  )
}
