import React, { useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'
import { TransactionInstruction } from '@solana/web3.js'
import { SecondaryButton } from '@components/Button'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { chunks } from '@utils/helpers'
import {
  registrarKey,
  voterWeightRecordKey,
} from '@helium/voter-stake-registry-sdk'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { ProposalState } from '@solana/spl-governance'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwner'

const NFT_SOL_BALANCE = 0.0014616

const ClaimUnreleasedPositions = ({
  inAccountDetails,
}: {
  inAccountDetails?: boolean
}) => {
  const wallet = useWalletOnePointOh()
  const [isLoading, setIsLoading] = useState(false)
  const { current: connection } = useWalletStore((s) => s.connection)
  const [ownVoteRecords, setOwnVoteRecords] = useState<any[]>([])
  const [solToBeClaimed, setSolToBeClaimed] = useState(0)
  const ownVoteRecordsFilterd = ownVoteRecords
  const { realm } = useWalletStore((s) => s.selectedRealm)
  const votingPlugin = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )

  const { proposals } = useRealm()
  const { data: tokenOwnerRecord } = useAddressQuery_CommunityTokenOwner()
  const isHeliumVsr = votingPlugin.client instanceof HeliumVsrClient

  const releasePositions = async () => {
    if (!wallet?.publicKey) throw new Error('no wallet')
    if (!realm) throw new Error()
    if (!tokenOwnerRecord) throw new Error()

    setIsLoading(true)
    const instructions: TransactionInstruction[] = []
    const [registrar] = registrarKey(
      realm.pubkey,
      realm.account.communityMint,
      votingPlugin.client!.program.programId
    )

    const [voterWeightPk] = voterWeightRecordKey(
      registrar,
      wallet.publicKey,
      votingPlugin.client!.program.programId
    )

    const nfts = ownVoteRecordsFilterd
    for (const i of nfts) {
      const proposal = proposals[i.account.proposal.toBase58()]
      if (proposal.account.state === ProposalState.Voting) {
        // ignore this one as it's still in voting
        continue
      }

      const relinquishNftVoteIx = await (votingPlugin.client as HeliumVsrClient).program.methods
        .relinquishVoteV0()
        .accounts({
          registrar,
          voterWeightRecord: voterWeightPk,
          governance: proposal.account.governance,
          proposal: i.account.proposal,
          voterTokenOwnerRecord: tokenOwnerRecord,
          voterAuthority: wallet.publicKey,
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
      getVoteRecords()
    } catch (e) {
      setIsLoading(false)
      console.log(e)
    }
  }
  const getVoteRecords = async () => {
    const currentClient = votingPlugin.client as HeliumVsrClient
    const voteRecords: any = []

    const voteRecordsFiltered = voteRecords.filter(
      (x) =>
        proposals[x.account.proposal.toBase58()] &&
        proposals[
          x.account.proposal.toBase58()
        ].account.governingTokenMint.toBase58() ===
          realm?.account.communityMint.toBase58() &&
        proposals[x.account.proposal.toBase58()].account.state !==
          ProposalState.Voting
    )
    setOwnVoteRecords(voteRecordsFiltered)
    setSolToBeClaimed(1 * NFT_SOL_BALANCE)
  }

  useEffect(() => {
    if (wallet?.publicKey && isHeliumVsr && votingPlugin.client) {
      getVoteRecords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [votingPlugin.clientType, isHeliumVsr, wallet?.publicKey?.toBase58()])

  if (isHeliumVsr) {
    return (
      <>
        {((!inAccountDetails && solToBeClaimed > 0) ||
          (inAccountDetails && solToBeClaimed != 0)) && (
          <div className="w-full">
            <div className="flex flex-col w-full gap-2 items-center">
              <div className="mb-2 text-xs text-white/50 max-w-[300px] text-center">
                You have {solToBeClaimed.toFixed(4)} SOL to reclaim from
                proposal voting costs and unlock your positions.
              </div>
              <SecondaryButton
                isLoading={isLoading}
                onClick={() => releasePositions()}
                className="w-1/2 max-w-[200px]"
              >
                Claim
              </SecondaryButton>
            </div>
          </div>
        )}
      </>
    )
  } else {
    return null
  }
}

export default ClaimUnreleasedPositions
