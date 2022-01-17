import { MintInfo } from '@solana/spl-token'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import BN from 'bn.js'
import useRealm from '@hooks/useRealm'
import { Proposal, ProposalState, RpcContext } from '@solana/spl-governance'
import { getUnrelinquishedVoteRecords } from '@models/api'
import { getProposal } from '@solana/spl-governance'
import { withRelinquishVote } from '@solana/spl-governance'
import useWalletStore from '../../../stores/useWalletStore'
import { sendTransaction } from '@utils/send'
import Button from '@components/Button'
import { Option } from '@tools/core/option'
import { GoverningTokenType } from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { withFinalizeVote } from '@solana/spl-governance'
import { chunks } from '@utils/helpers'
import {
  ArrowsExpandIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline'
import Link from 'next/link'
import useQueryContext from '@hooks/useQueryContext'
import Tooltip from '@components/Tooltip'
import { voteRegistryDeposit } from 'VoteStakeRegistry/actions/voteRegistryDeposit'
import { getProgramVersionForRealm } from '@models/registry/api'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
import { withVoteRegistryWithdraw } from 'VoteStakeRegistry/actions/withVoteRegistryWithdraw'
import {
  Deposit,
  getUsedDeposit,
} from 'VoteStakeRegistry/utils/voteRegistryTools'
import { useEffect, useState } from 'react'

const LockPluginTokenBalanceCard = ({
  proposal,
}: {
  proposal?: Option<Proposal>
}) => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { councilMint, mint, realm, symbol } = useRealm()
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
  const backLink = fmtUrlWithCluster(`/dao/${symbol}/account`)
    ? fmtUrlWithCluster(`/dao/${symbol}/account`)
    : ''
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-4 flex">
        Account
        <Link href={backLink}>
          <ArrowsExpandIcon className="text-fgd-3 flex-shrink-0 h-5 w-5 ml-auto cursor-pointer"></ArrowsExpandIcon>
        </Link>
      </h3>
      {hasLoaded ? (
        <>
          {communityDepositVisible && (
            <TokenDeposit
              mint={mint}
              tokenType={GoverningTokenType.Community}
              councilVote={false}
            />
          )}
          {councilDepositVisible && (
            <div className="mt-4">
              <TokenDeposit
                mint={councilMint}
                tokenType={GoverningTokenType.Council}
                councilVote={true}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="animate-pulse bg-bkg-3 h-12 mb-4 rounded-lg" />
          <div className="animate-pulse bg-bkg-3 h-10 rounded-lg" />
        </>
      )}
    </div>
  )
}

const TokenDeposit = ({
  mint,
  tokenType,
  councilVote,
}: {
  mint: MintInfo | undefined
  tokenType: GoverningTokenType
  councilVote?: boolean
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const { fetchWalletTokenAccounts, fetchRealm } = useWalletStore(
    (s) => s.actions
  )
  const {
    realm,
    realmInfo,
    realmTokenAccount,
    ownTokenRecord,
    ownCouncilTokenRecord,
    councilTokenAccount,
    proposals,
    governances,
    tokenRecords,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()
  const { client } = useVoteRegistry()
  // Do not show deposits for mints with zero supply because nobody can deposit anyway
  if (!mint || mint.supply.isZero()) {
    return null
  }
  const [depositRecord, setDeposit] = useState<Deposit | null>(null)

  const depositTokenRecord =
    tokenType === GoverningTokenType.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord

  const depositTokenAccount =
    tokenType === GoverningTokenType.Community
      ? realmTokenAccount
      : councilTokenAccount

  const depositMint =
    tokenType === GoverningTokenType.Community
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const tokenName = getMintMetadata(depositMint)?.name ?? realm?.account.name

  const depositTokenName = `${tokenName} ${
    tokenType === GoverningTokenType.Community ? '' : 'Council'
  }`

  const depositTokens = async function (amount: BN) {
    if (!realm) {
      throw 'No realm selected'
    }
    const hasTokenOwnerRecord =
      typeof tokenRecords[wallet!.publicKey!.toBase58()] !== 'undefined'
    const rpcContext = new RpcContext(
      realm.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection,
      endpoint
    )
    await voteRegistryDeposit({
      rpcContext,
      fromPk: depositTokenAccount!.publicKey,
      mint: depositMint!,
      realmPk: realm.pubkey,
      programId: realm.owner,
      amount,
      hasTokenOwnerRecord,
      client,
    })

    handleGetUsedDeposit()
    await fetchWalletTokenAccounts()
    await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
  }

  const depositAllTokens = async () =>
    await depositTokens(depositTokenAccount!.account.amount)

  const withdrawAllTokens = async function () {
    const instructions: TransactionInstruction[] = []

    // If there are unrelinquished votes for the voter then let's release them in the same instruction as convenience
    if (depositTokenRecord!.account!.unrelinquishedVotesCount > 0) {
      const voteRecords = await getUnrelinquishedVoteRecords(
        connection,
        realmInfo!.programId,
        depositTokenRecord!.account!.governingTokenOwner
      )

      console.log('Vote Records', voteRecords)

      for (const voteRecord of Object.values(voteRecords)) {
        let proposal = proposals[voteRecord.account.proposal.toBase58()]
        if (!proposal) {
          continue
        }

        if (proposal.account.state === ProposalState.Voting) {
          // If the Proposal is in Voting state refetch it to make sure we have the latest state to avoid false positives
          proposal = await getProposal(connection, proposal.pubkey)
          if (proposal.account.state === ProposalState.Voting) {
            const governance =
              governances[proposal.account.governance.toBase58()]
            if (proposal.account.getTimeToVoteEnd(governance.account) > 0) {
              // Note: It's technically possible to withdraw the vote here but I think it would be confusing and people would end up unconsciously withdrawing their votes
              throw new Error(
                `Can't withdraw tokens while Proposal ${proposal.account.name} is being voted on. Please withdraw your vote first`
              )
            } else {
              // finalize proposal before withdrawing tokens so we don't stop the vote from succeeding
              await withFinalizeVote(
                instructions,
                realmInfo!.programId,
                realm!.pubkey,
                proposal.account.governance,
                proposal.pubkey,
                proposal.account.tokenOwnerRecord,
                proposal.account.governingTokenMint
              )
            }
          }
        }

        // Note: We might hit single transaction limits here (accounts and size) if user has too many unrelinquished votes
        // It's not going to be an issue for now due to the limited number of proposals so I'm leaving it for now
        // As a temp. work around I'm leaving the 'Release Tokens' button on finalized Proposal to make it possible to release the tokens from one Proposal at a time
        withRelinquishVote(
          instructions,
          realmInfo!.programId,
          proposal.account.governance,
          proposal.pubkey,
          depositTokenRecord!.pubkey,
          proposal.account.governingTokenMint,
          voteRecord.pubkey,
          depositTokenRecord!.account.governingTokenOwner,
          wallet!.publicKey!
        )
      }
    }

    await withVoteRegistryWithdraw(
      instructions,
      wallet!.publicKey!,
      depositTokenAccount!.publicKey!,
      depositTokenRecord!.account.governingTokenMint,
      realm!.pubkey!,
      depositRecord!.amountDepositedNative,
      tokenRecords[wallet!.publicKey!.toBase58()].pubkey!,
      client
    )

    try {
      // use chunks of 8 here since we added finalize,
      // because previously 9 withdraws used to fit into one tx
      const ixChunks = chunks(instructions, 8)
      for (const [index, chunk] of ixChunks.entries()) {
        const transaction = new Transaction().add(...chunk)
        await sendTransaction({
          connection,
          wallet,
          transaction,
          sendingMessage:
            index == ixChunks.length - 1
              ? 'Withdrawing tokens'
              : `Releasing tokens (${index}/${ixChunks.length - 2})`,
          successMessage:
            index == ixChunks.length - 1
              ? 'Tokens have been withdrawn'
              : `Released tokens (${index}/${ixChunks.length - 2})`,
        })
      }
      await fetchWalletTokenAccounts()
      await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
      handleGetUsedDeposit()
    } catch (ex) {
      console.error("Can't withdraw tokens", ex)
    }
  }
  const handleGetUsedDeposit = async () => {
    const deposit = await getUsedDeposit(
      realm!.pubkey,
      depositTokenRecord!.account.governingTokenMint,
      wallet!.publicKey!,
      client!,
      'none'
    )
    if (deposit) {
      setDeposit(deposit)
    }
  }

  const hasTokensInWallet =
    depositTokenAccount && depositTokenAccount.account.amount.gt(new BN(0))

  const hasTokensDeposited =
    depositRecord && depositRecord.amountDepositedNative.gt(new BN(0))

  const depositTooltipContent = !connected
    ? 'Connect your wallet to deposit'
    : !hasTokensInWallet
    ? "You don't have any governance tokens in your wallet to deposit."
    : ''

  const withdrawTooltipContent = !connected
    ? 'Connect your wallet to withdraw'
    : !hasTokensDeposited
    ? "You don't have any tokens deposited to withdraw."
    : !councilVote &&
      (toManyCouncilOutstandingProposalsForUse ||
        toManyCommunityOutstandingProposalsForUser)
    ? "You don't have any governance tokens to withdraw."
    : ''

  const availableTokens =
    depositRecord && mint
      ? fmtMintAmount(mint, depositRecord.amountDepositedNative)
      : '0'

  const canShowAvailableTokensMessage =
    !hasTokensDeposited && hasTokensInWallet && connected
  const canExecuteAction = !hasTokensDeposited ? 'deposit' : 'withdraw'
  const canDepositToken = !hasTokensDeposited && hasTokensInWallet
  const tokensToShow =
    canDepositToken && depositTokenAccount
      ? fmtMintAmount(mint, depositTokenAccount.account.amount)
      : canDepositToken
      ? availableTokens
      : 0

  useEffect(() => {
    if (client && wallet?.connected) {
      handleGetUsedDeposit()
    }
  }, [wallet?.connected, client])

  return (
    <>
      <div className="flex space-x-4 items-center mt-8">
        <div className="bg-bkg-1 px-4 py-2 rounded-md w-full">
          <p className="text-fgd-3 text-xs">{depositTokenName} Votes</p>
          <h3 className="mb-0 py-2 flex items-center">
            {availableTokens}{' '}
            {tokenType === GoverningTokenType.Community && (
              <Tooltip content="Lorem ipsum">
                <div className="rounded-full px-2 py-1 ml-3 border text-xs border-fgd-3 flex">
                  1x
                  <QuestionMarkCircleIcon className="w-4 h-4 ml-1"></QuestionMarkCircleIcon>
                </div>
              </Tooltip>
            )}
          </h3>
        </div>
      </div>

      <p
        className={`mt-2 opacity-70 mb-4 ml-1 text-xs ${
          canShowAvailableTokensMessage ? 'block' : 'hidden'
        }`}
      >
        You have {tokensToShow} tokens available to {canExecuteAction}.
      </p>

      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <Button
          tooltipMessage={depositTooltipContent}
          className="sm:w-1/2"
          disabled={!connected || !hasTokensInWallet}
          onClick={depositAllTokens}
        >
          Deposit
        </Button>

        <Button
          tooltipMessage={withdrawTooltipContent}
          className="sm:w-1/2"
          disabled={
            !connected ||
            !hasTokensDeposited ||
            (!councilVote && toManyCommunityOutstandingProposalsForUser) ||
            toManyCouncilOutstandingProposalsForUse
          }
          onClick={withdrawAllTokens}
        >
          Withdraw
        </Button>
      </div>
    </>
  )
}

export default LockPluginTokenBalanceCard
