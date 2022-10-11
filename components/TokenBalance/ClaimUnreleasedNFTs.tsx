import useRealm from '@hooks/useRealm'
import React, { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { TransactionInstruction } from '@solana/web3.js'
import Button from '@components/Button'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { NftVoterClient } from '@solana/governance-program-library'
import { chunks } from '@utils/helpers'
import { getRegistrarPDA, getVoterWeightRecord } from '@utils/plugin/accounts'
import {
  sendTransactionsV2,
  SequenceType,
  transactionInstructionsToTypedInstructionsSets,
} from '@utils/sendTransactions'

const ClaimUnreleasedNFTs = () => {
  const wallet = useWalletStore((s) => s.current)
  const [isLoading, setIsLoading] = useState(false)
  const { current: connection } = useWalletStore((s) => s.connection)
  const [ownNftVoteRecords, setOwnNftVoteRecords] = useState<any[]>([])
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
      //MULTIPLY HERE... rough_amount += 0.001...
      instructions.push(relinquishNftVoteIx)
    }
    try {
      const insertChunks = chunks(instructions, 10)
      const signerChunks = Array(insertChunks.length).fill([])
      await sendTransactionsV2({
        connection,
        showUiComponent: true,
        wallet: wallet!,
        signersSet: [...signerChunks],
        TransactionInstructions: insertChunks.map((x) =>
          transactionInstructionsToTypedInstructionsSets(
            x,
            SequenceType.Parallel
          )
        ),
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
  useEffect(() => {
    if (wallet?.publicKey && isNftMode && client.client) {
      getNftsVoteRecord()
    }
  }, [client.clientType, isNftMode, wallet?.publicKey?.toBase58()])

  return (
    <>
      {isNftMode && ownNftVoteRecordsFilterd.length !== 0 && (
        <div>
          <h4 className="flex items-center">
            Claim ({ownNftVoteRecordsFilterd.length}) SOL
            <Button
              isLoading={isLoading}
              disabled={isLoading || !ownNftVoteRecordsFilterd.length}
              onClick={() => releaseNfts()}
              className="ml-2"
              small
            >
              Claim
            </Button>
          </h4>
        </div>
      )}
    </>
  )
}

export default ClaimUnreleasedNFTs
