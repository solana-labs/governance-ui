import {
  Account,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import BN from 'bn.js'
import useRealm from '../hooks/useRealm'
import { ProposalState } from '../models/accounts'
import { getProposal, getUnrelinquishedVoteRecords } from '../models/api'
import { withDepositGoverningTokens } from '../models/withDepositGoverningTokens'
import { withRelinquishVote } from '../models/withRelinquishVote'
import { withWithdrawGoverningTokens } from '../models/withWithdrawGoverningTokens'
import useWalletStore from '../stores/useWalletStore'
import { fmtTokenAmount } from '../utils/formatting'
import { sendTransaction } from '../utils/send'
import { approveTokenTransfer, TOKEN_PROGRAM_ID } from '../utils/tokens'
import Button from './Button'

const TokenBalanceCard = () => {
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const { fetchWalletTokenAccounts, fetchRealm } = useWalletStore(
    (s) => s.actions
  )
  const {
    symbol,
    mint,
    realm,
    realmInfo,
    realmTokenAccount,
    ownTokenRecord,
    proposals,
  } = useRealm()

  const depositTokens = async function (amount: BN) {
    const instructions: TransactionInstruction[] = []
    const signers: Account[] = []

    const transferAuthority = approveTokenTransfer(
      instructions,
      [],
      realmTokenAccount.publicKey,
      wallet.publicKey,
      amount
    )

    signers.push(transferAuthority)

    await withDepositGoverningTokens(
      instructions,
      realmInfo.programId,
      realm.pubkey,
      realmTokenAccount.publicKey,
      realm.info.communityMint,
      wallet.publicKey,
      transferAuthority.publicKey,
      wallet.publicKey,
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
    await fetchRealm(realmInfo.programId, realmInfo.realmId)
  }

  const depositAllTokens = async () =>
    await depositTokens(realmTokenAccount.account.amount)

  const withdrawAllTokens = async function () {
    const instructions: TransactionInstruction[] = []

    // If there are unrelinquished votes for the voter then let's release them in the same instruction as convenience
    if (ownTokenRecord.info.unrelinquishedVotesCount > 0) {
      const voteRecords = await getUnrelinquishedVoteRecords(
        realmInfo.programId,
        endpoint,
        ownTokenRecord.info.governingTokenOwner
      )

      for (const voteRecord of Object.values(voteRecords)) {
        let proposal = proposals[voteRecord.info.proposal.toBase58()]
        if (!proposal) {
          throw new Error(
            `Can't find Proposal for VoteRecord[${voteRecord.pubkey.toBase58()}]`
          )
        }

        if (proposal.info.state === ProposalState.Voting) {
          // If the Proposal is in Voting state refetch it to make sure we have the latest state to avoid false positives
          proposal = await getProposal(connection, proposal.pubkey)
          if (proposal.info.state === ProposalState.Voting) {
            // Note: It's technically possible to withdraw the vote here but I think it would be confusing and people would end up unconsciously withdrawing their votes
            throw new Error(
              `Can't withdraw tokens while Proposal ${proposal.info.name} is being voted on. Please withdraw your vote first`
            )
          }
        }

        // Note: We might hit single transaction limits here (accounts and size) if user has too many unrelinquished votes
        // It's not going to be an issue for now due to the limited number of proposals so I'm leaving it for now
        // As a temp. work around I'm leaving the 'Release Tokens' button on finalized Proposal to make it possible to release the tokens from one Proposal at a time
        withRelinquishVote(
          instructions,
          realmInfo.programId,
          proposal.info.governance,
          proposal.pubkey,
          ownTokenRecord.pubkey,
          proposal.info.governingTokenMint,
          voteRecord.pubkey,
          ownTokenRecord.info.governingTokenOwner,
          wallet.publicKey
        )
      }
    }

    await withWithdrawGoverningTokens(
      instructions,
      realmInfo.programId,
      realm.pubkey,
      realmTokenAccount.publicKey,
      realm.info.communityMint,
      wallet.publicKey,
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
      await fetchRealm(realmInfo.programId, realmInfo.realmId)
    } catch (ex) {
      console.error("Can't withdraw tokens", ex)
    }
  }

  const hasTokensInWallet =
    realmTokenAccount && realmTokenAccount.account.amount.gt(new BN(0))

  const hasTokensDeposited =
    ownTokenRecord &&
    ownTokenRecord.info.governingTokenDepositAmount.gt(new BN(0))

  return (
    <div className="bg-bkg-2 p-6 rounded-lg">
      <h3 className="mb-4">Deposit Tokens</h3>

      <div className="flex space-x-4 items-center pb-6">
        <div className="bg-bkg-1 px-4 py-2 rounded w-full">
          <p className="text-fgd-3 text-xs">{symbol} Votes</p>
          <div className="font-bold">
            {ownTokenRecord && mint
              ? fmtTokenAmount(
                  ownTokenRecord.info.governingTokenDepositAmount,
                  mint.decimals
                )
              : '0'}
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          className="w-1/2"
          disabled={!connected || !hasTokensInWallet}
          onClick={depositAllTokens}
        >
          Deposit
        </Button>
        <Button
          className="w-1/2"
          disabled={!connected || !hasTokensDeposited}
          onClick={withdrawAllTokens}
        >
          Withdraw
        </Button>
      </div>
    </div>
  )
}

export default TokenBalanceCard
