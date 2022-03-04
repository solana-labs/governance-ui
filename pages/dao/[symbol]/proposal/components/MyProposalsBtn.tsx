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
import { sendTransaction } from '@utils/send'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import Modal from '@components/Modal'
import { useHasVoteTimeExpired } from '@hooks/useHasVoteTimeExpired'
import useGovernanceAssets from '@hooks/useGovernanceAssets'

const MyProposals = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const { governancesArray } = useGovernanceAssets()
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const { current: connection } = useWalletStore((s) => s.connection)
  const ownVoteRecordsByProposal = useWalletStore(
    (s) => s.ownVoteRecordsByProposal
  )

  const { realm, programId, programVersion, tokenRecords } = useWalletStore(
    (s) => s.selectedRealm
  )

  const { client } = useVoteStakeRegistryClientStore((s) => s.state)
  const { proposals } = useRealm()

  const myProposals = useMemo(
    () =>
      connected
        ? Object.values(proposals).filter(
            (p) => !ownVoteRecordsByProposal[p.pubkey.toBase58()]
          )
        : [],
    [proposals, ownVoteRecordsByProposal, connected]
  )
  const drafts = myProposals.filter(
    (x) => x.account.state === ProposalState.Draft
  )
  const notfinalized = connected
    ? myProposals.filter((x) => {
        const gov = governancesArray.find(
          (gov) => gov.pubkey.toBase58() === x.account.governance.toBase58()
        )
        const hasVoteTimeExpired = x.account.isVoteFinalized()
          ? 0 // If vote is finalized then set the timestamp to 0 to make it expired
          : x.account.votingAt && gov
          ? x.account.votingAt.toNumber() + gov?.account.config.maxVotingTime
          : undefined
        return x.account.state === ProposalState.Voting && hasVoteTimeExpired
      })
    : []

  const approveAll = async () => {
    if (!wallet || !programId || !realm) return

    const governanceAuthority = wallet.publicKey!
    const payer = wallet.publicKey!

    const { blockhash: recentBlockhash } = await connection.getRecentBlockhash()

    const transactions = await Promise.all(
      votingProposals.map(async (proposal) => {
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
          programId,
          programVersion,
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

        const transaction = new Transaction({
          recentBlockhash,
          feePayer: wallet.publicKey!,
        })
        transaction.add(...instructions)
        return transaction
      })
    )

    const signedTXs = await wallet.signAllTransactions(transactions)

    await Promise.all(
      signedTXs.map((transaction) =>
        sendTransaction({ transaction, wallet, connection })
      )
    )
  }

  return (
    <>
      <div>
        <a
          className={`cursor-pointer hover:bg-bkg-3 default-transition flex items-center rounded-full ring-1 ring-fgd-3 px-3 py-2.5 text-fgd-1 text-sm focus:outline-none`}
          onClick={() => setModalIsOpen(true)}
        >
          <BadgeCheckIcon className="h-5 mr-1.5 text-primary-light w-5" />
          My proposals
        </a>
      </div>
      {modalIsOpen && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setModalIsOpen(false)
          }}
          isOpen={modalIsOpen}
        >
          <>
            <h3 className="mb-4 flex items-center">Your proposals</h3>
            <h4>Your drafts</h4>
            <div className="mb-3">
              {drafts.map((x) => (
                <div key={x.pubkey.toBase58()}>{x.account.name}</div>
              ))}
            </div>
            <h4>Unfinalized</h4>
            <div className="mb-3">
              {notfinalized.map((x) => (
                <div key={x.pubkey.toBase58()}>{x.account.name}</div>
              ))}
            </div>
            <h4>Unreleased tokens</h4>
            <div></div>
          </>
        </Modal>
      )}
    </>
  )
}

export default MyProposals
