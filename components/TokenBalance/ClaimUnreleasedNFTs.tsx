import useRealm from '@hooks/useRealm'
import { useEffect, useState } from 'react'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { SecondaryButton } from '@components/Button'
import { chunks } from '@utils/helpers'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { ProgramAccount, Proposal, ProposalState, getProposal } from '@solana/spl-governance'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useConnection } from '@solana/wallet-adapter-react'
import queryClient from '@hooks/queries/queryClient'
import asFindable from '@utils/queries/asFindable'
import {
  proposalQueryKeys,
  useRealmProposalsQuery,
} from '@hooks/queries/proposal'
import {useNftClient} from "../../VoterWeightPlugins/useNftClient";

const NFT_SOL_BALANCE = 0.0014616

type NftRecordsSet = {
  proposal: PublicKey,
  records: PublicKey[]
}

const ClaimUnreleasedNFTs = ({
  inAccountDetails,
}: {
  inAccountDetails?: boolean
}) => {
  const wallet = useWalletOnePointOh()
  const [isLoading, setIsLoading] = useState(false)
  const { connection } = useConnection()
  const [ownNftVoteRecords, setOwnNftVoteRecords] = useState<any[]>([])
  const [solToBeClaimed, setSolToBeClaimed] = useState(0)
  const ownNftVoteRecordsFilterd = ownNftVoteRecords
  const realm = useRealmQuery().data?.result
  const { nftClient } = useNftClient();
  const { isNftMode } = useRealm()

  const { data: tokenOwnerRecord } = useAddressQuery_CommunityTokenOwner()
  const { data: proposals } = useRealmProposalsQuery()

  const releaseNfts = async (count: number | null = null) => {
    if (!wallet?.publicKey) throw new Error('no wallet')
    if (!realm) throw new Error()
    if (!tokenOwnerRecord) throw new Error()
    if (!nftClient) throw new Error("not an NFT realm")

    setIsLoading(true)
    const instructions: TransactionInstruction[] = []
    const { registrar } = nftClient.getRegistrarPDA(realm.pubkey, realm.account.communityMint);

    const { voterWeightPk } = await nftClient.getVoterWeightRecordPDA(realm.pubkey, realm.account.communityMint, wallet.publicKey)

    const nfts = ownNftVoteRecordsFilterd.slice(
      0,
      count ? count : ownNftVoteRecordsFilterd.length
    )

    const fetchedProposals: ProgramAccount<Proposal>[]  = [];
    const nftRecordsSet: NftRecordsSet[] = [];

    for (const i of nfts) {
      const isProposalFetched = fetchedProposals.find(proposal => proposal.pubkey.equals(i.account.proposal))
      let currentProposal: ProgramAccount<Proposal> | undefined;

      if (isProposalFetched) {
        currentProposal = isProposalFetched
      } else {
        const proposalQuery = await queryClient.fetchQuery({
          queryKey: proposalQueryKeys.byPubkey(
            connection.rpcEndpoint,
            i.account.proposal
          ),
          staleTime: 0,
          queryFn: () =>
            asFindable(() => getProposal(connection, i.account.proposal))(),
        })
        currentProposal = proposalQuery.result
        if (proposalQuery.result) {
          fetchedProposals.push(proposalQuery.result)
          nftRecordsSet.push({
            proposal: proposalQuery.result.pubkey,
            records: []
          })
        }
      }

      if (
        currentProposal === undefined ||
        currentProposal.account.state === ProposalState.Voting
      ) {
        // ignore this one as it's still in voting
        continue
      }
      const currentRecordsIndex = nftRecordsSet.findIndex(r => r.proposal.equals(currentProposal!.pubkey))
      nftRecordsSet[currentRecordsIndex].records.push(i.publicKey)
    }

    for (const r of nftRecordsSet) {
      const ixChunks = chunks(r.records, 25)

      for (const ix of ixChunks) {
        const proposal = fetchedProposals.find(p => p.pubkey.equals(r.proposal))

        const relinquishNftVoteIx = await nftClient.program.methods
          .relinquishNftVote()
          .accounts({
            registrar,
            voterWeightRecord: voterWeightPk,
            governance: proposal!.account.governance,
            proposal: r.proposal,
            voterTokenOwnerRecord: tokenOwnerRecord,
            voterAuthority: wallet.publicKey!,
            voteRecord: ix[0],
            beneficiary: wallet!.publicKey!,
          })
          .remainingAccounts(ix.map(c => (
            { pubkey: c, isSigner: false, isWritable: true }
          )))
          .instruction()
        
        instructions.push(relinquishNftVoteIx)
      } 
    }

    try {
      const insertChunks = chunks(instructions, 1).map((txBatch, batchIdx) => {
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
    if (!nftClient) throw new Error("not an NFT realm");
    const nftVoteRecords = await nftClient.program.account.nftVoteRecord?.all([
      {
        memcmp: {
          offset: 72,
          bytes: wallet!.publicKey!.toBase58(),
        },
      },
    ])

    const nftVoteRecordsFiltered = nftVoteRecords.filter((x) => {
      const proposal = proposals?.find((y) =>
        y.pubkey.equals(x.account.proposal)
      )
      return (
        proposal &&
        proposal.account.governingTokenMint.toBase58() ===
          realm?.account.communityMint.toBase58() &&
        proposal.account.state !== ProposalState.Voting
      )
    })

    setOwnNftVoteRecords(nftVoteRecordsFiltered)
    setSolToBeClaimed(nftVoteRecordsFiltered.length * NFT_SOL_BALANCE)
  }
  useEffect(() => {
    if (wallet?.publicKey && isNftMode && nftClient) {
      getNftsVoteRecord()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [nftClient, isNftMode, wallet?.publicKey?.toBase58()])

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
