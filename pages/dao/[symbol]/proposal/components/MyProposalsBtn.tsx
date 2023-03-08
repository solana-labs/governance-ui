import useRealm from '@hooks/useRealm'
import React, { useEffect, useMemo, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import {
  getProposalDepositsByDepositPayer,
  ProgramAccount,
  Proposal,
  ProposalDeposit,
  ProposalState,
  withCancelProposal,
  withFinalizeVote,
  withRefundProposalDeposit,
  withRelinquishVote,
} from '@solana/spl-governance'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import Modal from '@components/Modal'
import Button from '@components/Button'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import dayjs from 'dayjs'
import { notify } from '@utils/notifications'
import Loading from '@components/Loading'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { sleep } from '@project-serum/common'
import { NftVoterClient } from '@solana/governance-program-library'
import { chunks } from '@utils/helpers'
import { sendSignedTransaction } from '@utils/send'
import { getRegistrarPDA, getVoterWeightRecord } from '@utils/plugin/accounts'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import useQueryContext from '@hooks/useQueryContext'

const MyProposalsBn = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const [isLoading, setIsLoading] = useState(false)
  const { governancesArray } = useGovernanceAssets()
  const { current: connection } = useWalletStore((s) => s.connection)
  const ownVoteRecordsByProposal = useWalletStore(
    (s) => s.ownVoteRecordsByProposal
  )
  const [ownNftVoteRecords, setOwnNftVoteRecords] = useState<any[]>([])
  const ownNftVoteRecordsFilterd = ownNftVoteRecords
  const maxVoterWeight =
    useNftPluginStore((s) => s.state.maxVoteRecord)?.pubkey || undefined
  const { realm, programId, programVersion } = useWalletStore(
    (s) => s.selectedRealm
  )
  const { refetchProposals } = useWalletStore((s) => s.actions)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const [
    proposalsWithDepositedTokens,
    setProposalsWithDepositedTokens,
  ] = useState<ProgramAccount<ProposalDeposit>[]>([])
  const {
    proposals,
    ownTokenRecord,
    ownCouncilTokenRecord,
    realmInfo,
    isNftMode,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
  const unReleased = [...Object.values(proposals)].filter(
    (x) =>
      (x.account.state === ProposalState.Completed ||
        x.account.state === ProposalState.Executing ||
        x.account.state === ProposalState.SigningOff ||
        x.account.state === ProposalState.Succeeded ||
        x.account.state === ProposalState.ExecutingWithErrors ||
        x.account.state === ProposalState.Defeated ||
        x.account.state === ProposalState.Vetoed ||
        x.account.state === ProposalState.Cancelled) &&
      ownVoteRecordsByProposal[x.pubkey.toBase58()] &&
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
    setIsLoading(true)
    try {
      const {
        blockhash: recentBlockhash,
      } = await connection.getLatestBlockhash()

      const transactions: Transaction[] = []
      for (let i = 0; i < proposalsArray.length; i++) {
        const proposal = proposalsArray[i]

        const instructions: TransactionInstruction[] = []

        await withInstruction(instructions, proposal)

        const transaction = new Transaction({
          recentBlockhash,
          feePayer: wallet.publicKey!,
        })
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
      await sleep(500)
      await refetchProposals()
    } catch (e) {
      console.log(e)
      notify({ type: 'error', message: 'Something wnet wrong' })
    }
    setIsLoading(false)
  }

  const cleanDrafts = (toIndex = null) => {
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
    cleanSelected(drafts.slice(0, toIndex || drafts.length), withInstruction)
  }
  const releaseAllTokens = (toIndex = null) => {
    const withInstruction = async (
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
      const inst = await withRelinquishVote(
        instructions,
        realm!.owner,
        realmInfo!.programVersion!,
        realm!.pubkey,
        proposal.account.governance,
        proposal.pubkey,
        voterTokenRecord!.pubkey,
        proposal.account.governingTokenMint,
        ownVoteRecordsByProposal[proposal.pubkey.toBase58()].pubkey,
        governanceAuthority,
        beneficiary
      )
      await client.withRelinquishVote(
        instructions,
        proposal,
        ownVoteRecordsByProposal[proposal.pubkey.toBase58()].pubkey
      )
      return inst
    }
    cleanSelected(
      unReleased.slice(0, toIndex || unReleased.length),
      withInstruction
    )
  }
  const finalizeAll = (toIndex = null) => {
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
        proposal.account.governingTokenMint,
        maxVoterWeight
      )
    }
    cleanSelected(
      notfinalized.slice(0, toIndex || notfinalized.length),
      withInstruction
    )
  }
  const releaseNfts = async (count: number | null = null) => {
    setIsLoading(true)
    const instructions: TransactionInstruction[] = []
    const { registrar } = await getRegistrarPDA(
      realm!.pubkey,
      realm!.account.communityMint,
      client.client!.program.programId
    )
    const { voterWeightPk } = await getVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      wallet!.publicKey!,
      client.client!.program.programId
    )
    const nfts = ownNftVoteRecordsFilterd.slice(
      0,
      count ? count : ownNftVoteRecordsFilterd.length
    )
    for (const i of nfts) {
      const relinquishNftVoteIx = await (client.client as NftVoterClient).program.methods
        .relinquishNftVote()
        .accounts({
          registrar,
          voterWeightRecord: voterWeightPk,
          governance:
            proposals[i.account.proposal.toBase58()].account.governance,
          proposal: i.account.proposal,
          governingTokenOwner: wallet!.publicKey!,
          voteRecord: i.publicKey,
          beneficiary: wallet!.publicKey!,
        })
        .remainingAccounts([
          { pubkey: i.publicKey, isSigner: false, isWritable: true },
        ])
        .instruction()
      instructions.push(relinquishNftVoteIx)
    }
    try {
      const insertChunks = chunks(instructions, 10).map((txBatch, batchIdx) => {
        return {
          instructionsSet: txBatchesToInstructionSetWithSigners(
            txBatch,
            [],
            batchIdx
          ),
          sequenceType: SequenceType.Parallel,
        }
      })
      await sendTransactionsV3({
        connection,
        wallet: wallet!,
        transactionInstructions: insertChunks,
      })
      setIsLoading(false)
      getNftsVoteRecord()
    } catch (e) {
      setIsLoading(false)
      console.log(e)
    }
  }
  const getNftsVoteRecord = async () => {
    const nftClient = client.client as NftVoterClient
    const nftVoteRecords = await nftClient.program.account.nftVoteRecord.all([
      {
        memcmp: {
          offset: 72,
          bytes: wallet!.publicKey!.toBase58(),
        },
      },
    ])

    const nftVoteRecordsFiltered = nftVoteRecords.filter(
      (x) =>
        proposals[x.account.proposal.toBase58()] &&
        proposals[
          x.account.proposal.toBase58()
        ].account.governingTokenMint.toBase58() ===
          realm?.account.communityMint.toBase58()
    )
    setOwnNftVoteRecords(nftVoteRecordsFiltered)
  }
  const releaseSol = async () => {
    const instructions: TransactionInstruction[] = []
    for (const proposalDeposit of proposalsWithDepositedTokens) {
      await withRefundProposalDeposit(
        instructions,
        programId!,
        programVersion,
        proposalDeposit.account.proposal,
        proposalDeposit.account.depositPayer
      )
    }
    await sendTransactionsV3({
      connection,
      wallet: wallet!,
      transactionInstructions: instructions.map((x, idx) => ({
        instructionsSet: txBatchesToInstructionSetWithSigners([x], [], idx),
        sequenceType: SequenceType.Parallel,
      })),
    })
    getSolDeposits()
  }
  const getSolDeposits = async () => {
    const solDeposits = await getProposalDepositsByDepositPayer(
      connection,
      realm!.owner,
      wallet!.publicKey!
    )
    const filterdSolDeposits = solDeposits.filter((x) => {
      const proposalState =
        proposals[x.account.proposal.toBase58()].account.state
      return (
        proposalState !== ProposalState.Draft &&
        proposalState !== ProposalState.Voting &&
        proposalState !== ProposalState.SigningOff
      )
    })
    setProposalsWithDepositedTokens(filterdSolDeposits)
  }
  useEffect(() => {
    if (
      wallet?.publicKey &&
      modalIsOpen &&
      realmInfo!.programVersion &&
      realmInfo!.programVersion > 2 &&
      Object.keys(proposals).length
    ) {
      getSolDeposits()
    }
  }, [
    wallet?.publicKey?.toBase58(),
    modalIsOpen,
    realmInfo?.programVersion,
    Object.keys(proposals).length,
  ])
  useEffect(() => {
    if (wallet?.publicKey && isNftMode && client.client && modalIsOpen) {
      getNftsVoteRecord()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [client.clientType, isNftMode, wallet?.publicKey?.toBase58(), modalIsOpen])

  return (
    <>
      <div>
        <Button onClick={() => setModalIsOpen(true)}>My proposals</Button>
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
            <h3 className="mb-4 flex flex-col">
              Your proposals {isLoading && <Loading w="50px"></Loading>}
            </h3>
            {proposalsWithDepositedTokens.length !== 0 && (
              <div>
                <div className="mb-4">
                  You have some sol to be released from proposals deposits
                </div>
                <Button className="mb-4" onClick={releaseSol}>
                  Release sol
                </Button>
              </div>
            )}
            <ProposalList
              title="Drafts"
              fcn={cleanDrafts}
              btnName="Cancel"
              proposals={drafts}
              isLoading={isLoading}
            ></ProposalList>
            <ProposalList
              title="Unfinalized"
              fcn={finalizeAll}
              btnName="Finalize"
              proposals={notfinalized}
              isLoading={isLoading}
            ></ProposalList>
            <ProposalList
              title="Unreleased proposals"
              fcn={releaseAllTokens}
              btnName="Release"
              proposals={unReleased}
              isLoading={isLoading}
            ></ProposalList>
            <ProposalList
              title="Created vote in progress"
              fcn={() => null}
              btnName=""
              proposals={createdVoting}
              isLoading={isLoading}
            ></ProposalList>
            {isNftMode && ownNftVoteRecordsFilterd.length !== 0 && (
              <div>
                <h4 className="flex items-center mb-3">
                  Unreleased nfts ({ownNftVoteRecordsFilterd.length})
                  <Button
                    isLoading={isLoading}
                    disabled={isLoading || !ownNftVoteRecordsFilterd.length}
                    onClick={() => releaseNfts()}
                    className="ml-2"
                    small
                  >
                    Release nfts
                  </Button>
                  <Button
                    isLoading={isLoading}
                    disabled={isLoading || !ownNftVoteRecordsFilterd.length}
                    onClick={() => releaseNfts(50)}
                    className="ml-2"
                    small
                  >
                    Release first 50
                  </Button>
                </h4>
              </div>
            )}
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
  isLoading,
}: {
  title: string
  fcn: (count?) => void
  btnName: string
  proposals: ProgramAccount<Proposal>[]
  isLoading: boolean
}) => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol } = useRealm()
  return (
    <>
      {' '}
      <h4 className="flex items-center mb-3">
        {title} ({proposals.length})
        {btnName && proposals.length !== 0 && (
          <div className="ml-auto">
            <Button
              small
              isLoading={isLoading}
              className="mr-3"
              onClick={() => fcn(5)}
              disabled={isLoading}
            >
              {btnName} first 5
            </Button>
            <Button
              small
              isLoading={isLoading}
              onClick={() => fcn()}
              disabled={isLoading}
            >
              {btnName} all
            </Button>
          </div>
        )}
      </h4>
      <div className="mb-3 ">
        {proposals.map((x) => (
          <div
            className="text-xs border-fgd-4 border px-3 py-2 mb-3 rounded-lg"
            key={x.pubkey.toBase58()}
          >
            <a
              className="underline cursor-pointer"
              href={fmtUrlWithCluster(
                `/dao/${symbol}/proposal/${x.pubkey.toBase58()}`
              )}
              target="_blank"
              rel="noreferrer"
            >
              {x.account.name}
            </a>
          </div>
        ))}
      </div>
    </>
  )
}

export default MyProposalsBn
