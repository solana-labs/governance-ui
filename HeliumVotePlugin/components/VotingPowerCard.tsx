import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BN } from '@project-serum/anchor'
import {
  getTokenOwnerRecordAddress,
  GoverningTokenRole,
} from '@solana/spl-governance'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import useQueryContext from '@hooks/useQueryContext'
import { ChevronRightIcon } from '@heroicons/react/solid'
import InlineNotification from '@components/InlineNotification'
import DelegateTokenBalanceCard from '@components/TokenBalance/DelegateTokenBalanceCard'
import { TokenDeposit } from '@components/TokenBalance/TokenBalanceCard'
import useWalletStore from 'stores/useWalletStore'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'
import { MintInfo } from '@solana/spl-token'
import { VotingPowerBox } from './VotingPowerBox'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'

export const VotingPowerCard: React.FC<{
  inAccountDetails?: boolean
}> = ({ inAccountDetails }) => {
  const { fmtUrlWithCluster } = useQueryContext()
  const [hasGovPower, setHasGovPower] = useState(false)
  const [tokenOwnerRecordPk, setTokenOwnerRecordPk] = useState('')
  const { councilMint, mint, realm, symbol, config } = useRealm()
  const [connected, wallet] = useWalletStore((s) => [s.connected, s.current])
  const [currentClient] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
  ])
  const councilDepositVisible = !!councilMint

  useEffect(() => {
    const getTokenOwnerRecord = async () => {
      const defaultMint =
        !mint?.supply.isZero() ||
        config?.account.communityTokenConfig.maxVoterWeightAddin
          ? realm!.account.communityMint
          : !councilMint?.supply.isZero()
          ? realm!.account.config.councilMint
          : undefined

      const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
        realm!.owner,
        realm!.pubkey,
        defaultMint!,
        currentClient!.walletPk!
      )
      setTokenOwnerRecordPk(tokenOwnerRecordAddress.toBase58())
    }

    if (realm && wallet?.connected && currentClient.walletPk) {
      getTokenOwnerRecord()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    realm?.pubkey.toBase58(),
    wallet?.connected,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    currentClient.walletPk?.toBase58(),
  ])

  const isLoading = !mint || !councilMint
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="mb-0">My governance power</h3>
        <Link
          href={fmtUrlWithCluster(
            `/dao/${symbol}/account/${tokenOwnerRecordPk}`
          )}
        >
          <a
            className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3 ${
              !connected || !tokenOwnerRecordPk
                ? 'opacity-50 pointer-events-none'
                : ''
            }`}
          >
            View
            <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
          </a>
        </Link>
      </div>
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
              isSameWallet={wallet!.publicKey!.equals(currentClient!.walletPk!)}
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
  const { realm, realmTokenAccount } = useRealm()
  const [connected] = useWalletStore((s) => [s.connected])
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
      {votingPower.toNumber() > 0 && (
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
