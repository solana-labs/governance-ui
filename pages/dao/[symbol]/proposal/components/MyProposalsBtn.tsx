import useRealm from '@hooks/useRealm'
import React, { useMemo, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import {
  ProgramAccount,
  Proposal,
  ProposalState,
  withCancelProposal,
  withFinalizeVote,
  withRelinquishVote,
} from '@solana/spl-governance'
import { BadgeCheckIcon } from '@heroicons/react/outline'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import Modal from '@components/Modal'
import Button from '@components/Button'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import dayjs from 'dayjs'

const MyProposals = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const { governancesArray } = useGovernanceAssets()
  const { current: connection } = useWalletStore((s) => s.connection)
  const ownVoteRecordsByProposal = useWalletStore(
    (s) => s.ownVoteRecordsByProposal
  )
  const { realm, programId } = useWalletStore((s) => s.selectedRealm)
  const { fetchRealm } = useWalletStore((s) => s.actions)
  const {
    proposals,
    ownTokenRecord,
    ownCouncilTokenRecord,
    realmInfo,
  } = useRealm()
  const myProposals = useMemo(
    () =>
      connected
        ? Object.values(proposals).filter(
            (p) =>
              p.account.tokenOwnerRecord.toBase58() ===
                ownTokenRecord?.pubkey.toBase58() ||
              p.account.tokenOwnerRecord.toBase58() ===
                ownCouncilTokenRecord?.pubkey.toBase58()
          )
        : [],
    [proposals, ownVoteRecordsByProposal, connected]
  )
  const drafts = myProposals.filter((x) => {
    return x.account.state === ProposalState.Draft
  })
  const notfinalized = myProposals.filter((x) => {
    const governance = governancesArray.find(
      (gov) => gov.pubkey.toBase58() === x.account.governance.toBase58()
    )
    const now = dayjs().unix()
    const timestamp = x
      ? x.account.isVoteFinalized()
        ? 0 // If vote is finalized then set the timestamp to 0 to make it expired
        : x.account.votingAt && governance
        ? x.account.votingAt.toNumber() +
          governance.account.config.maxVotingTime
        : undefined
      : undefined
    return (
      x.account.state === ProposalState.Voting &&
      !x.account.isVoteFinalized() &&
      timestamp &&
      now > timestamp
    )
  })
  const unReleased = myProposals.filter(
    (x) =>
      (x.account.state === ProposalState.Succeeded ||
        x.account.state === ProposalState.Completed) &&
      x.account.isVoteFinalized() &&
      !ownVoteRecordsByProposal[x.pubkey.toBase58()]?.account.isRelinquished
  )
  const createdVoting = myProposals.filter((x) => {
    return (
      x.account.state === ProposalState.Voting && !x.account.isVoteFinalized()
    )
  })

  const cleanSelected = async (
    proposalsArray: ProgramAccount<Proposal>[],
    withInstruction
  ) => {
    if (!wallet || !programId || !realm) return

    const { blockhash: recentBlockhash } = await connection.getRecentBlockhash()

    const transactions = await Promise.all(
      proposalsArray.map(async (proposal) => {
        console.log(proposal.pubkey.toBase58(), ownTokenRecord)

        const instructions: TransactionInstruction[] = []

        await withInstruction(instructions, proposal)

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
    await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
  }

  const cleanDrafts = () => {
    const withInstruction = (instructions, proposal) => {
      return withCancelProposal(
        instructions,
        realm!.owner!,
        realmInfo!.programVersion!,
        realm!.pubkey!,
        proposal!.account.governance,
        proposal!.pubkey,
        proposal!.account.tokenOwnerRecord,
        wallet!.publicKey!
      )
    }
    cleanSelected(drafts, withInstruction)
  }
  const releaseAllTokens = () => {
    const withInstruction = (
      instructions,
      proposal: ProgramAccount<Proposal>
    ) => {
      const voterTokenRecord =
        proposal.account.governingTokenMint.toBase58() ===
        realm?.account.communityMint.toBase58()
          ? ownTokenRecord
          : ownCouncilTokenRecord
      const governanceAuthority = wallet!.publicKey!
      const beneficiary = wallet!.publicKey!

      return withRelinquishVote(
        instructions,
        realm!.owner,
        proposal.account.governance,
        proposal.pubkey,
        voterTokenRecord!.pubkey,
        proposal.account.governingTokenMint,
        ownVoteRecordsByProposal[proposal.pubkey.toBase58()].pubkey,
        governanceAuthority,
        beneficiary
      )
    }
    cleanSelected(unReleased, withInstruction)
  }
  const finalizeAll = () => {
    const withInstruction = (
      instructions,
      proposal: ProgramAccount<Proposal>
    ) => {
      return withFinalizeVote(
        instructions,
        realm!.owner,
        realmInfo!.programVersion!,
        realm!.pubkey!,
        proposal.account.governance,
        proposal.pubkey,
        proposal.account.tokenOwnerRecord,
        proposal.account.governingTokenMint
      )
    }
    cleanSelected(notfinalized, withInstruction)
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
            <ProposalList
              title="Your drafts"
              fcn={cleanDrafts}
              btnName="Cancel all"
              proposals={drafts}
            ></ProposalList>
            <ProposalList
              title="Unfinalized"
              fcn={finalizeAll}
              btnName="Finalize all"
              proposals={notfinalized}
            ></ProposalList>
            <ProposalList
              title="Unreleased tokens"
              fcn={releaseAllTokens}
              btnName="Release all"
              proposals={unReleased}
            ></ProposalList>
            <ProposalList
              title="Created vote in progress"
              fcn={() => null}
              btnName=""
              proposals={createdVoting}
            ></ProposalList>
          </>
        </Modal>
      )}
    </>
  )
}

const ProposalList = ({
  title,
  fcn,
  btnName,
  proposals,
}: {
  title: string
  fcn: () => void
  btnName: string
  proposals: ProgramAccount<Proposal>[]
}) => {
  return (
    <>
      {' '}
      <h4 className="flex items-center mb-3">
        {title} ({proposals.length})
        {btnName && proposals.length !== 0 && (
          <Button small className="ml-auto" onClick={fcn}>
            {btnName}
          </Button>
        )}
      </h4>
      <div className="mb-3 ">
        {proposals.map((x) => (
          <div
            className="text-xs border-fgd-4 border px-3 py-2 mb-3 rounded-lg"
            key={x.pubkey.toBase58()}
          >
            {x.account.name}
          </div>
        ))}
      </div>
    </>
  )
}

export default MyProposals
