/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MintInfo } from '@solana/spl-token'
import {
  Account,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import BN from 'bn.js'
import useRealm from '../hooks/useRealm'
import { Proposal, ProposalState } from '../models/accounts'
import {
  getGovernance,
  getProposal,
  getUnrelinquishedVoteRecords,
} from '../models/api'
import { withDepositGoverningTokens } from '../models/withDepositGoverningTokens'
import { withRelinquishVote } from '../models/withRelinquishVote'
import { withWithdrawGoverningTokens } from '../models/withWithdrawGoverningTokens'
import useWalletStore from '../stores/useWalletStore'
import { sendTransaction } from '../utils/send'
import { approveTokenTransfer, TOKEN_PROGRAM_ID } from '../utils/tokens'
import Button from './Button'
import { Option } from '../tools/core/option'
import { GoverningTokenType } from '../models/enums'
import { fmtMintAmount } from '../tools/sdk/units'
import { getMintMetadata } from './instructions/programs/splToken'
import { withFinalizeVote } from '@models/withFinalizeVote'

const TokenBalanceCard = ({ proposal }: { proposal?: Option<Proposal> }) => {
  const { councilMint, mint, realm } = useRealm()

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
    !realm?.info.config.councilMint ||
    isDepositVisible(mint, realm?.info.communityMint)

  const councilDepositVisible = isDepositVisible(
    councilMint,
    realm?.info.config.councilMint
  )

  const hasLoaded = mint || councilMint

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg">
      <h3 className="mb-4">Governance Tokens</h3>
      {hasLoaded ? (
        <>
          {communityDepositVisible && (
            <TokenDeposit
              mint={mint}
              tokenType={GoverningTokenType.Community}
            ></TokenDeposit>
          )}
          {councilDepositVisible && (
            <div className="mt-4">
              <TokenDeposit
                mint={councilMint}
                tokenType={GoverningTokenType.Council}
              ></TokenDeposit>
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
}: {
  mint: MintInfo | undefined
  tokenType: GoverningTokenType
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
  } = useRealm()

  // Do not show deposits for mints with zero supply because nobody can deposit anyway
  if (!mint || mint.supply.isZero()) {
    return null
  }

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
      ? realm?.info.communityMint
      : realm?.info.config.councilMint

  const tokenName = getMintMetadata(depositMint)?.name ?? realm?.info.name

  const depositTokenName = `${tokenName} ${
    tokenType === GoverningTokenType.Community ? '' : 'Council'
  }`

  const depositTokens = async function (amount: BN) {
    const instructions: TransactionInstruction[] = []
    const signers: Account[] = []

    const transferAuthority = approveTokenTransfer(
      instructions,
      [],
      depositTokenAccount!.publicKey,
      wallet!.publicKey!,
      amount
    )

    signers.push(transferAuthority)

    await withDepositGoverningTokens(
      instructions,
      realmInfo!.programId,
      realm!.pubkey,
      depositTokenAccount!.publicKey,
      depositTokenAccount!.account.mint,
      wallet!.publicKey!,
      transferAuthority.publicKey,
      wallet!.publicKey!,
      TOKEN_PROGRAM_ID,
      SystemProgram.programId
    )

    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      connection,
      wallet,
      transaction,
      signers,
      sendingMessage: 'Depositing tokens',
      successMessage: 'Tokens have been deposited',
    })

    await fetchWalletTokenAccounts()
    await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
  }

  const depositAllTokens = async () =>
    await depositTokens(depositTokenAccount!.account.amount)

  const withdrawAllTokens = async function () {
    const instructions: TransactionInstruction[] = []

    // If there are unrelinquished votes for the voter then let's release them in the same instruction as convenience
    if (depositTokenRecord!.info!.unrelinquishedVotesCount > 0) {
      const voteRecords = await getUnrelinquishedVoteRecords(
        realmInfo!.programId,
        endpoint,
        depositTokenRecord!.info!.governingTokenOwner
      )

      for (const voteRecord of Object.values(voteRecords)) {
        let proposal = proposals[voteRecord.info.proposal.toBase58()]
        if (!proposal) {
          continue
        }

        if (proposal.info.state === ProposalState.Voting) {
          // If the Proposal is in Voting state refetch it to make sure we have the latest state to avoid false positives
          proposal = await getProposal(connection, proposal.pubkey)
          if (proposal.info.state === ProposalState.Voting) {
            const governance = await getGovernance(
              connection,
              proposal.info.governance
            )
            if (proposal.info.getTimeToVoteEnd(governance.info) > 0) {
              // Note: It's technically possible to withdraw the vote here but I think it would be confusing and people would end up unconsciously withdrawing their votes
              throw new Error(
                `Can't withdraw tokens while Proposal ${proposal.info.name} is being voted on. Please withdraw your vote first`
              )
            } else {
              // finalize proposal before withdrawing tokens so we don't stop the vote from succeeding
              await withFinalizeVote(
                instructions,
                realmInfo!.programId,
                realm!.pubkey,
                proposal.info.governance,
                proposal.pubkey,
                proposal.info.governingTokenMint
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
          proposal.info.governance,
          proposal.pubkey,
          depositTokenRecord!.pubkey,
          proposal.info.governingTokenMint,
          voteRecord.pubkey,
          depositTokenRecord!.info.governingTokenOwner,
          wallet!.publicKey
        )
      }
    }

    await withWithdrawGoverningTokens(
      instructions,
      realmInfo!.programId,
      realm!.pubkey,
      depositTokenAccount!.publicKey,
      depositTokenRecord!.info.governingTokenMint,
      wallet!.publicKey!,
      TOKEN_PROGRAM_ID
    )

    const transaction = new Transaction()
    transaction.add(...instructions)

    try {
      await sendTransaction({
        connection,
        wallet,
        transaction,
        sendingMessage: 'Withdrawing tokens',
        successMessage: 'Tokens have been withdrawn',
      })

      await fetchWalletTokenAccounts()
      await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
    } catch (ex) {
      console.error("Can't withdraw tokens", ex)
    }
  }

  const hasTokensInWallet =
    depositTokenAccount && depositTokenAccount.account.amount.gt(new BN(0))

  const hasTokensDeposited =
    depositTokenRecord &&
    depositTokenRecord.info.governingTokenDepositAmount.gt(new BN(0))

  return (
    <>
      <div className="flex space-x-4 items-center pb-6">
        <div className="bg-bkg-1 px-4 py-2 rounded-md w-full">
          <p className="text-fgd-3 text-xs">{depositTokenName} Votes</p>
          <h3 className="mb-0">
            {depositTokenRecord && mint
              ? fmtMintAmount(
                  mint,
                  depositTokenRecord.info.governingTokenDepositAmount
                )
              : '0'}
          </h3>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <Button
          className="sm:w-1/2"
          disabled={!connected || !hasTokensInWallet}
          onClick={depositAllTokens}
        >
          Deposit
        </Button>
        <Button
          className="sm:w-1/2"
          disabled={!connected || !hasTokensDeposited}
          onClick={withdrawAllTokens}
        >
          Withdraw
        </Button>
      </div>
    </>
  )
}

export default TokenBalanceCard
