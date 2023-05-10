import { MintInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import useRealm from '@hooks/useRealm'
import { getTokenOwnerRecordAddress, Proposal } from '@solana/spl-governance'
import { Option } from '@tools/core/option'
import { GoverningTokenRole } from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import useQueryContext from '@hooks/useQueryContext'
import DepositCommunityTokensBtn from './DepositCommunityTokensBtn'
import WithDrawCommunityTokens from './WithdrawCommunityTokensBtn'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import VotingPowerBox from './VotingPowerBox'
import { useEffect, useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/solid'
import InlineNotification from '@components/InlineNotification'
import Link from 'next/link'
import DelegateTokenBalanceCard from '@components/TokenBalance/DelegateTokenBalanceCard'
import { TokenDeposit } from '@components/TokenBalance/TokenBalanceCard'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

const LockPluginTokenBalanceCard = ({
  proposal,
  inAccountDetails,
}: {
  proposal?: Option<Proposal>
  inAccountDetails?: boolean
}) => {
  const [hasGovPower, setHasGovPower] = useState<boolean>(false)
  const { fmtUrlWithCluster } = useQueryContext()
  const { councilMint, mint, realm, symbol, config } = useRealm()
  const [tokenOwnerRecordPk, setTokenOwneRecordPk] = useState('')
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const walletPublicKey = wallet?.publicKey

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

  const defaultMint =
    mint?.supply.isZero() ||
    config?.account.communityTokenConfig.maxVoterWeightAddin
      ? realm?.account.communityMint
      : councilMint?.supply.isZero()
      ? realm?.account.config.councilMint
      : undefined

  useEffect(() => {
    const getTokenOwnerRecord = async () => {
      const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
        realm!.owner,
        realm!.pubkey,
        defaultMint!,
        walletPublicKey!
      )
      setTokenOwneRecordPk(tokenOwnerRecordAddress.toBase58())
    }
    if (realm && connected) {
      getTokenOwnerRecord()
    }
  }, [defaultMint, realm, connected, walletPublicKey])

  const hasLoaded = mint || councilMint
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
      {hasLoaded ? (
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
          {communityDepositVisible && (
            <TokenDepositLock
              inAccountDetails={inAccountDetails}
              mint={mint}
              tokenRole={GoverningTokenRole.Community}
              councilVote={false}
              setHasGovPower={setHasGovPower}
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
  tokenRole,
  inAccountDetails,
  setHasGovPower,
}: {
  mint: MintInfo | undefined
  tokenRole: GoverningTokenRole
  councilVote?: boolean
  inAccountDetails?: boolean
  setHasGovPower: (hasGovPower: boolean) => void
}) => {
  const { realm, realmTokenAccount, councilTokenAccount } = useRealm()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const deposits = useDepositStore((s) => s.state.deposits)
  const votingPower = useDepositStore((s) => s.state.votingPower)
  const votingPowerFromDeposits = useDepositStore(
    (s) => s.state.votingPowerFromDeposits
  )
  const lockedTokensAmount = deposits
    .filter(
      (x) =>
        typeof x.lockup.kind['none'] === 'undefined' &&
        x.mint.publicKey.toBase58() === realm?.account.communityMint.toBase58()
    )
    .reduce((curr, next) => curr.add(next.currentlyLocked), new BN(0))

  const depositRecord = deposits.find(
    (x) =>
      x.mint.publicKey.toBase58() === realm!.account.communityMint.toBase58() &&
      x.lockup.kind.none
  )

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
    depositRecord && depositRecord.amountDepositedNative.gt(new BN(0))

  const lockTokensFmt =
    lockedTokensAmount && mint ? fmtMintAmount(mint, lockedTokensAmount) : '0'

  const availableTokens =
    depositRecord && mint
      ? fmtMintAmount(mint, depositRecord.amountDepositedNative)
      : '0'

  useEffect(() => {
    if (availableTokens != '0' || hasTokensDeposited || hasTokensInWallet) {
      setHasGovPower(true)
    }
  }, [availableTokens, hasTokensDeposited, hasTokensInWallet])

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
    <>
      {canShowAvailableTokensMessage ? (
        <div className="pt-2">
          <InlineNotification
            desc={`You have ${tokensToShow} ${
              hasTokensDeposited ? `more` : ``
            } ${depositTokenName} available to deposit.`}
            type="info"
          />
        </div>
      ) : null}
      {votingPower.toNumber() > 0 && (
        <div className="flex space-x-4 items-center mt-4">
          <VotingPowerBox
            votingPower={votingPower}
            mint={mint}
            votingPowerFromDeposits={votingPowerFromDeposits}
            className="w-full px-4 py-2"
          ></VotingPowerBox>
        </div>
      )}
      {(availableTokens != '0' || lockTokensFmt != '0') && (
        <div className="pt-4 px-4">
          {availableTokens != '0' && (
            <p className="flex mb-1.5 text-xs">
              <span>{depositTokenName} Deposited</span>
              <span className="font-bold ml-auto text-fgd-1">
                {availableTokens}
              </span>
            </p>
          )}
          {availableTokens != '0' && (
            <p className="flex text-xs">
              <span>{depositTokenName} Locked</span>
              <span className="font-bold ml-auto text-fgd-1">
                {lockTokensFmt}
              </span>
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <DepositCommunityTokensBtn
          inAccountDetails={inAccountDetails}
        ></DepositCommunityTokensBtn>
        {inAccountDetails && (
          <WithDrawCommunityTokens></WithDrawCommunityTokens>
        )}
      </div>
    </>
  )
}

export default LockPluginTokenBalanceCard
