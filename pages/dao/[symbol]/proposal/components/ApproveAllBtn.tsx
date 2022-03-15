import useRealm from '@hooks/useRealm'
import React, { useMemo, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import Tooltip from '@components/Tooltip'
import {
  ProposalState,
  Vote,
  withCastVote,
  YesNoVote,
} from '@solana/spl-governance'
import { BadgeCheckIcon } from '@heroicons/react/outline'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { withUpdateVoterWeightRecord } from 'VoteStakeRegistry/sdk/withUpdateVoterWeightRecord'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import { sendSignedTransaction } from '@utils/sendTransactions'
import { notify } from '@utils/notifications'
import Loading from '@components/Loading'

const ApproveAllBtn = () => {
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const { current: connection } = useWalletStore((s) => s.connection)
  const ownVoteRecordsByProposal = useWalletStore(
    (s) => s.ownVoteRecordsByProposal
  )

  const { client } = useVoteStakeRegistryClientStore((s) => s.state)
  const { proposals, realmInfo, realm, tokenRecords } = useRealm()
  const [isLoading, setIsLoading] = useState(false)
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm)
  const votingProposals = useMemo(
    () =>
      Object.values(proposals).filter(
        (p) =>
          p.account.state == ProposalState.Voting &&
          !ownVoteRecordsByProposal[p.pubkey.toBase58()]
      ),
    [proposals, ownVoteRecordsByProposal]
  )

  const tooltipContent = !connected
    ? 'Connect your wallet to approve proposals'
    : votingProposals.length === 0
    ? 'There is no proposals to vote on'
    : ''

  const canApproveProposals = connected && votingProposals.length > 0

  const approveAll = async () => {
    if (!wallet || !realmInfo!.programId || !realm) return

    const governanceAuthority = wallet.publicKey!
    const payer = wallet.publicKey!

    try {
      setIsLoading(true)
      const {
        blockhash: recentBlockhash,
      } = await connection.getRecentBlockhash()

      const transactions: Transaction[] = []
      for (let i = 0; i < votingProposals.length; i++) {
        const proposal = votingProposals[i]
        const ownTokenRecord = tokenRecords[wallet.publicKey!.toBase58()]

        console.log(proposal.pubkey.toBase58(), ownTokenRecord)

        const instructions: TransactionInstruction[] = []

        //will run only if plugin is connected with realm
        const voterWeight = await withUpdateVoterWeightRecord(
          instructions,
          wallet.publicKey!,
          realm,
          client
        )
        await withCastVote(
          instructions,
          realmInfo!.programId,
          realmInfo!.programVersion!,
          realm.pubkey,
          proposal.account.governance,
          proposal.pubkey,
          proposal.account.tokenOwnerRecord,
          ownTokenRecord.pubkey,
          governanceAuthority,
          proposal.account.governingTokenMint,
          Vote.fromYesNoVote(YesNoVote.Yes),
          payer,
          voterWeight
        )

        const transaction = new Transaction()
        transaction.add(...instructions)
        transaction.recentBlockhash = recentBlockhash
        transaction.setSigners(
          // fee payed by the wallet owner
          wallet.publicKey!
        )
        transactions.push(transaction)
      }
      const signedTXs = await wallet.signAllTransactions(transactions)
      await Promise.all(
        signedTXs.map((transaction) =>
          sendSignedTransaction({ signedTransaction: transaction, connection })
        )
      )
      await fetchRealm(realmInfo!.programId!, realm.pubkey)
      notify({
        message: 'Successfully voted on all proposals',
        type: 'success',
      })
    } catch (e) {
      notify({ type: 'erorr', message: `Something went wrong, ${e}` })
    }
    setIsLoading(false)
  }

  return (
    <>
      <Tooltip content={tooltipContent}>
        <div
          className={
            !canApproveProposals ? 'cursor-not-allowed opacity-60' : ''
          }
        >
          {isLoading ? (
            <Loading></Loading>
          ) : (
            <a
              className={`${
                !canApproveProposals
                  ? 'cursor-not-allowed pointer-events-none'
                  : 'cursor-pointer hover:bg-bkg-3'
              } default-transition flex items-center rounded-full ring-1 ring-fgd-3 px-3 py-2.5 text-fgd-1 text-sm focus:outline-none`}
              onClick={approveAll}
            >
              <BadgeCheckIcon className="h-5 mr-1.5 text-primary-light w-5" />
              Approve All
            </a>
          )}
        </div>
      </Tooltip>
    </>
  )
}

export default ApproveAllBtn
