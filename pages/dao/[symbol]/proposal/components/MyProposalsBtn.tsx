import useRealm from '@hooks/useRealm'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getProposalDepositsByDepositPayer,
  getVoteRecord,
  getVoteRecordAddress,
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
import { chunks } from '@utils/helpers'
import { sendSignedTransaction } from '@utils/send'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import useQueryContext from '@hooks/useQueryContext'
import { useMaxVoteRecord } from '@hooks/useMaxVoteRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwnerRecord'
import {
  tokenOwnerRecordQueryKeys,
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import {
  useVoteRecordsByOwnerQuery,
  voteRecordQueryKeys,
} from '@hooks/queries/voteRecord'
import useProgramVersion from '@hooks/useProgramVersion'
import { DEFAULT_GOVERNANCE_PROGRAM_VERSION } from '@components/instructions/tools'
import { useConnection } from '@solana/wallet-adapter-react'
import {
  proposalQueryKeys,
  useRealmProposalsQuery,
} from '@hooks/queries/proposal'
import queryClient from '@hooks/queries/queryClient'
import { getFeeEstimate } from '@tools/feeEstimate'
import { createComputeBudgetIx } from '@blockworks-foundation/mango-v4'
import {useVotingClients} from "@hooks/useVotingClients";
import {useNftClient} from "../../../../../VoterWeightPlugins/useNftClient";

const MyProposalsBn = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const [isLoading, setIsLoading] = useState(false)
  const { governancesArray } = useGovernanceAssets()
  const { connection } = useConnection()
  const myVoteRecords = useVoteRecordsByOwnerQuery(
    wallet?.publicKey ?? undefined
  ).data

  const ownVoteRecordsByProposal = useMemo(() => {
    return myVoteRecords !== undefined
      ? (Object.fromEntries(
          myVoteRecords.map((x) => [x.account.proposal.toString(), x] as const)
        ) as Record<string, typeof myVoteRecords[number]>)
      : undefined
  }, [myVoteRecords])

  const [ownNftVoteRecords, setOwnNftVoteRecords] = useState<any[]>([])
  const ownNftVoteRecordsFilterd = ownNftVoteRecords

  const { data: tokenOwnerRecord } = useAddressQuery_CommunityTokenOwner()

  const maxVoterWeight = useMaxVoteRecord()?.pubkey || undefined
  const realm = useRealmQuery().data?.result
  const programId = realm?.owner

  const programVersion =
    useProgramVersion() ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION

  const votingClients = useVotingClients();
  const { nftClient } = useNftClient();

  const [
    proposalsWithDepositedTokens,
    setProposalsWithDepositedTokens,
  ] = useState<ProgramAccount<ProposalDeposit>[]>([])
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result

  const { realmInfo, isNftMode } = useRealm()
  const { data: proposals } = useRealmProposalsQuery()
  const myProposals = useMemo(
    () =>
      connected
        ? proposals?.filter(
            (p) =>
              p.account.tokenOwnerRecord.toBase58() ===
                ownTokenRecord?.pubkey.toBase58() ||
              p.account.tokenOwnerRecord.toBase58() ===
                ownCouncilTokenRecord?.pubkey.toBase58()
          )
        : [],
    [
      connected,
      proposals,
      ownTokenRecord?.pubkey,
      ownCouncilTokenRecord?.pubkey,
    ]
  )
  const drafts = myProposals?.filter((x) => {
    return x.account.state === ProposalState.Draft
  })
  const notfinalized = myProposals?.filter((x) => {
    const governance = governancesArray?.find(
      (gov) => gov.pubkey.toBase58() === x.account.governance.toBase58()
    )
    const now = dayjs().unix()
    const timestamp = x
      ? x.account.isVoteFinalized()
        ? 0 // If vote is finalized then set the timestamp to 0 to make it expired
        : x.account.votingAt && governance
        ? x.account.votingAt.toNumber() +
          governance.account.config.baseVotingTime
        : undefined
      : undefined
    return (
      x.account.state === ProposalState.Voting &&
      !x.account.isVoteFinalized() &&
      timestamp &&
      now > timestamp
    )
  })
  const unReleased = proposals?.filter(
    (x) =>
      (x.account.state === ProposalState.Completed ||
        x.account.state === ProposalState.Executing ||
        x.account.state === ProposalState.SigningOff ||
        x.account.state === ProposalState.Succeeded ||
        x.account.state === ProposalState.ExecutingWithErrors ||
        x.account.state === ProposalState.Defeated ||
        x.account.state === ProposalState.Vetoed ||
        x.account.state === ProposalState.Cancelled) &&
      ownVoteRecordsByProposal?.[x.pubkey.toBase58()] &&
      !ownVoteRecordsByProposal?.[x.pubkey.toBase58()]?.account.isRelinquished
  )

  const createdVoting = myProposals?.filter((x) => {
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
      const [{ blockhash: recentBlockhash }, fee] = await Promise.all([
        connection.getLatestBlockhash(),
        getFeeEstimate(connection),
      ])

      const transactions: Transaction[] = []
      const instructions: TransactionInstruction[] = []
      for (let i = 0; i < proposalsArray.length; i++) {
        const proposal = proposalsArray[i]

        await withInstruction(instructions, proposal)
      }
      const instructionChunks = chunks(instructions, 8)
      for (const chunk of instructionChunks) {
        const transaction = new Transaction({
          recentBlockhash,
          feePayer: wallet.publicKey!,
        })
        transaction.add(...[createComputeBudgetIx(fee), ...chunk])
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
      queryClient.invalidateQueries({
        queryKey: proposalQueryKeys.all(connection.rpcEndpoint),
      })
      queryClient.invalidateQueries({
        queryKey: tokenOwnerRecordQueryKeys.all(connection.rpcEndpoint),
      })
      queryClient.invalidateQueries({
        queryKey: voteRecordQueryKeys.all(
          connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet'
        ),
      })
    } catch (e) {
      console.log(e)
      notify({ type: 'error', message: `Something went wrong ${e}` })
    }
    setIsLoading(false)
  }

  const cleanDrafts = (toIndex = null) => {
    if (!drafts) throw new Error()
    const withInstruction = (instructions, proposal) => {
      return withCancelProposal(
        instructions,
        realm!.owner!,
        programVersion,
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
    if (unReleased === undefined) throw new Error()
    const withInstruction = async (
      instructions,
      proposal: ProgramAccount<Proposal>
    ) => {
      let voterTokenRecord =
        proposal.account.governingTokenMint.toBase58() ===
        realm?.account.communityMint.toBase58()
          ? ownTokenRecord
          : ownCouncilTokenRecord
      const role = proposal.account.governingTokenMint.toBase58() ===
        realm?.account.communityMint.toBase58()
        ? 'community'
        : 'council'
      const governanceAuthority = wallet!.publicKey!
      const beneficiary = wallet!.publicKey!

      let voteRecordPk = await getVoteRecordAddress(
        realm!.owner,
        proposal.pubkey,
        voterTokenRecord!.pubkey
      )
      
      let governingTokenMint = proposal.account.governingTokenMint

      try {
        await getVoteRecord(connection, voteRecordPk)
      } catch {
        voterTokenRecord = role === "community" ?
          ownCouncilTokenRecord :
          ownTokenRecord

        voteRecordPk = await getVoteRecordAddress(
          realm!.owner,
          proposal.pubkey,
          voterTokenRecord!.pubkey
        )

        governingTokenMint = role === "community" && realm?.account.config.councilMint ?
          realm.account.config.councilMint :
          realm?.account.communityMint!
      }
      
      const inst = await withRelinquishVote(
        instructions,
        realm!.owner,
        realmInfo!.programVersion!,
        realm!.pubkey,
        proposal.account.governance,
        proposal.pubkey,
        voterTokenRecord!.pubkey,
        governingTokenMint,
        voteRecordPk,
        governanceAuthority,
        beneficiary
      )
      await votingClients(role).withRelinquishVote(
        instructions,
        proposal,
        voteRecordPk,
        voterTokenRecord!.pubkey
      )
      return inst
    }
    cleanSelected(
      unReleased.slice(0, toIndex || unReleased.length),
      withInstruction
    )
  }
  const finalizeAll = (toIndex = null) => {
    if (notfinalized === undefined) throw new Error()
    const withInstruction = (
      instructions,
      proposal: ProgramAccount<Proposal>
    ) => {
      return withFinalizeVote(
        instructions,
        realm!.owner,
        programVersion,
        realm!.pubkey,
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
    if (proposals === undefined) throw new Error()
    if (!realm) throw new Error()
    if (!wallet?.publicKey) throw new Error('no wallet')

    if (!nftClient) throw new Error('no nft client')

    setIsLoading(true)
    const instructions: TransactionInstruction[] = []
    const { registrar } = nftClient.getRegistrarPDA(realm.pubkey, realm.account.communityMint);
    const { voterWeightPk } = await nftClient.getVoterWeightRecordPDA(realm.pubkey, realm.account.communityMint, wallet.publicKey);

    const nfts = ownNftVoteRecordsFilterd.slice(
      0,
      count ? count : ownNftVoteRecordsFilterd.length
    )
    for (const i of nfts) {
      const proposal = proposals.find((p) =>
        p.pubkey.equals(i.account.proposal)
      )
      const relinquishNftVoteIx = await nftClient.program.methods
        .relinquishNftVote()
        .accounts({
          registrar,
          voterWeightRecord: voterWeightPk,
          governance: proposal?.account.governance,
          proposal: i.account.proposal,
          voterTokenOwnerRecord: tokenOwnerRecord,
          voterAuthority: wallet!.publicKey!,
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
      const insertChunks = chunks(instructions, 5).map((txBatch, batchIdx) => {
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

  const getNftsVoteRecord = useCallback(async () => {
    if (!nftClient) throw new Error('no nft client');
    const nftVoteRecords = await nftClient.program.account.nftVoteRecord.all([
      {
        memcmp: {
          offset: 72,
          bytes: wallet!.publicKey!.toBase58(),
        },
      },
    ])

    const nftVoteRecordsFiltered = nftVoteRecords.filter((x) => {
      const proposal = proposals?.find((p) =>
        p.pubkey.equals(x.account.proposal)
      )

      return (
        proposal &&
        proposal.account.governingTokenMint.toBase58() ===
          realm?.account.communityMint.toBase58()
      )
    })
    setOwnNftVoteRecords(nftVoteRecordsFiltered)
  }, [nftClient, proposals, realm?.account.communityMint, wallet])

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
  const getSolDeposits = useCallback(async () => {
    const solDeposits = await getProposalDepositsByDepositPayer(
      connection,
      realm!.owner,
      wallet!.publicKey!
    )
    const filterdSolDeposits = solDeposits.filter((x) => {
      const proposal = proposals?.find((p) =>
        p.pubkey.equals(x.account.proposal)
      )
      const proposalState = proposal?.account.state
      return (
        proposalState !== ProposalState.Draft &&
        proposalState !== ProposalState.Voting &&
        proposalState !== ProposalState.SigningOff
      )
    })
    setProposalsWithDepositedTokens(filterdSolDeposits)
  }, [connection, proposals, realm, wallet])
  useEffect(() => {
    if (
      wallet?.publicKey &&
      modalIsOpen &&
      realmInfo?.programVersion &&
      realmInfo?.programVersion > 2 &&
      proposals?.length
    ) {
      getSolDeposits()
    }
  }, [
    getSolDeposits,
    modalIsOpen,
    proposals,
    realmInfo,
    realmInfo?.programVersion,
    wallet?.publicKey,
  ])
  useEffect(() => {
    if (wallet?.publicKey && isNftMode && nftClient && modalIsOpen) {
      getNftsVoteRecord()
    }
  }, [
    nftClient,
    getNftsVoteRecord,
    isNftMode,
    modalIsOpen,
    wallet?.publicKey,
  ])

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
              proposals={drafts ?? []}
              isLoading={isLoading}
            ></ProposalList>
            <ProposalList
              title="Unfinalized"
              fcn={finalizeAll}
              btnName="Finalize"
              proposals={notfinalized ?? []}
              isLoading={isLoading}
            ></ProposalList>
            <ProposalList
              title="Unreleased proposals"
              fcn={releaseAllTokens}
              btnName="Release"
              proposals={unReleased ?? []}
              isLoading={isLoading}
            ></ProposalList>
            <ProposalList
              title="Created vote in progress"
              fcn={() => null}
              btnName=""
              proposals={createdVoting ?? []}
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
