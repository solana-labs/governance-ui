import useRealm from '@hooks/useRealm'
import React, { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { TransactionInstruction } from '@solana/web3.js'
import { SecondaryButton } from '@components/Button'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { NftVoterClient } from '@solana/governance-program-library'
import { chunks } from '@utils/helpers'
import { getRegistrarPDA, getVoterWeightRecord } from '@utils/plugin/accounts'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { ProposalState } from '@solana/spl-governance'
import useWalletGay from '@hooks/useWallet'

const NFT_SOL_BALANCE = 0.0014616

const ClaimUnreleasedNFTs = ({
  inAccountDetails,
}: {
  inAccountDetails?: boolean
}) => {
  const wallet = useWalletGay()
  const [isLoading, setIsLoading] = useState(false)
  const { current: connection } = useWalletStore((s) => s.connection)
  const [ownNftVoteRecords, setOwnNftVoteRecords] = useState<any[]>([])
  const [solToBeClaimed, setSolToBeClaimed] = useState(0)
  const ownNftVoteRecordsFilterd = ownNftVoteRecords
  const { realm } = useWalletStore((s) => s.selectedRealm)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const { proposals, isNftMode } = useRealm()

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
      const proposal = proposals[i.account.proposal.toBase58()]
      if (proposal.account.state === ProposalState.Voting) {
        // ignore this one as it's still in voting
        continue
      }
      const relinquishNftVoteIx = await (client.client as NftVoterClient).program.methods
        .relinquishNftVote()
        .accounts({
          registrar,
          voterWeightRecord: voterWeightPk,
          governance: proposal.account.governance,
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
    const nftVoteRecords = await nftClient.program.account.nftVoteRecord?.all([
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
          realm?.account.communityMint.toBase58() &&
        proposals[x.account.proposal.toBase58()].account.state !==
          ProposalState.Voting
    )
    setOwnNftVoteRecords(nftVoteRecordsFiltered)
    setSolToBeClaimed(nftVoteRecordsFiltered.length * NFT_SOL_BALANCE)
  }
  useEffect(() => {
    if (wallet?.publicKey && isNftMode && client.client) {
      getNftsVoteRecord()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [client.clientType, isNftMode, wallet?.publicKey?.toBase58()])

  if (isNftMode) {
    return (
      <>
        {((!inAccountDetails && solToBeClaimed > 1) ||
          (inAccountDetails && solToBeClaimed != 0)) && (
          <div className="mt-4 md:mt-6">
            <div className="flex flex-col w-aut gap-2">
              <div className="mt-3 text-xs text-white/50">
                You have {solToBeClaimed.toFixed(4)} SOL to reclaim from
                proposal voting costs
              </div>
              <SecondaryButton
                isLoading={isLoading}
                disabled={isLoading || !ownNftVoteRecordsFilterd.length}
                onClick={() => releaseNfts()}
                className="sm:w-1/2 max-w-[200px]"
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

export default ClaimUnreleasedNFTs
