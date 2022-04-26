import Button from '@components/Button'
import useRealm from '@hooks/useRealm'
import { getUnrelinquishedVoteRecords } from '@models/api'
import { BN } from '@project-serum/anchor'
import {
  getProposal,
  ProposalState,
  withFinalizeVote,
  withRelinquishVote,
} from '@solana/spl-governance'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { chunks } from '@utils/helpers'
import { sendTransaction } from '@utils/send'
import useWalletStore from 'stores/useWalletStore'
import { withVoteRegistryWithdraw } from 'VoteStakeRegistry/sdk/withVoteRegistryWithdraw'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import { getProgramVersionForRealm } from '@models/registry/api'
import { notify } from '@utils/notifications'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { useState } from 'react'
import Loading from '@components/Loading'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'

const WithDrawCommunityTokens = () => {
  const { getOwnedDeposits } = useDepositStore()
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const {
    realm,
    realmInfo,
    ownTokenRecord,
    proposals,
    governances,
    tokenRecords,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()
  const [isLoading, setIsLoading] = useState(false)
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection.current)
  const deposits = useDepositStore((s) => s.state.deposits)
  const { fetchRealm, fetchWalletTokenAccounts } = useWalletStore(
    (s) => s.actions
  )
  const maxVoterWeight =
    useNftPluginStore((s) => s.state.maxVoteRecord)?.pubkey || undefined
  const depositRecord = deposits.find(
    (x) =>
      x.mint.publicKey.toBase58() === realm!.account.communityMint.toBase58() &&
      x.lockup.kind.none
  )
  const withdrawAllTokens = async function () {
    setIsLoading(true)
    const instructions: TransactionInstruction[] = []
    // If there are unrelinquished votes for the voter then let's release them in the same instruction as convenience
    if (ownTokenRecord!.account!.unrelinquishedVotesCount > 0) {
      const voteRecords = await getUnrelinquishedVoteRecords(
        connection,
        realmInfo!.programId,
        ownTokenRecord!.account!.governingTokenOwner
      )

      for (const voteRecord of Object.values(voteRecords)) {
        let proposal = proposals[voteRecord.account.proposal.toBase58()]
        if (!proposal) {
          continue
        }

        if (proposal.account.state === ProposalState.Voting) {
          // If the Proposal is in Voting state refetch it to make sure we have the latest state to avoid false positives
          proposal = await getProposal(connection, proposal.pubkey)
          if (proposal.account.state === ProposalState.Voting) {
            const governance =
              governances[proposal.account.governance.toBase58()]
            if (proposal.account.getTimeToVoteEnd(governance.account) > 0) {
              setIsLoading(false)
              // Note: It's technically possible to withdraw the vote here but I think it would be confusing and people would end up unconsciously withdrawing their votes
              notify({
                type: 'error',
                message: `Can't withdraw tokens while Proposal ${proposal.account.name} is being voted on. Please withdraw your vote first`,
              })
              throw new Error(
                `Can't withdraw tokens while Proposal ${proposal.account.name} is being voted on. Please withdraw your vote first`
              )
            } else {
              // finalize proposal before withdrawing tokens so we don't stop the vote from succeeding
              await withFinalizeVote(
                instructions,
                realmInfo!.programId,
                getProgramVersionForRealm(realmInfo!),
                realm!.pubkey,
                proposal.account.governance,
                proposal.pubkey,
                proposal.account.tokenOwnerRecord,
                proposal.account.governingTokenMint,
                maxVoterWeight
              )
            }
          }
        }

        // Note: We might hit single transaction limits here (accounts and size) if user has too many unrelinquished votes
        // It's not going to be an issue for now due to the limited number of proposals so I'm leaving it for now
        // As a temp. work around I'm leaving the 'Release Tokens' button on finalized Proposal to make it possible to release the tokens from one Proposal at a time
        await withRelinquishVote(
          instructions,
          realmInfo!.programId,
          proposal.account.governance,
          proposal.pubkey,
          ownTokenRecord!.pubkey,
          proposal.account.governingTokenMint,
          voteRecord.pubkey,
          ownTokenRecord!.account.governingTokenOwner,
          wallet!.publicKey!
        )
      }
    }

    await withVoteRegistryWithdraw({
      instructions,
      walletPk: wallet!.publicKey!,
      mintPk: ownTokenRecord!.account.governingTokenMint,
      realmPk: realm!.pubkey!,
      amount: depositRecord!.amountDepositedNative,
      communityMintPk: realm!.account.communityMint,
      tokenOwnerRecordPubKey:
        tokenRecords[wallet!.publicKey!.toBase58()].pubkey!,
      depositIndex: depositRecord!.index,
      connection,
      client: client,
    })

    try {
      // use chunks of 8 here since we added finalize,
      // because previously 9 withdraws used to fit into one tx
      const ixChunks = chunks(instructions, 8)
      for (const [index, chunk] of ixChunks.entries()) {
        const transaction = new Transaction().add(...chunk)
        await sendTransaction({
          connection,
          wallet: wallet!,
          transaction,
          sendingMessage:
            index == ixChunks.length - 1
              ? 'Withdrawing tokens'
              : `Releasing tokens (${index}/${ixChunks.length - 2})`,
          successMessage:
            index == ixChunks.length - 1
              ? 'Tokens have been withdrawn'
              : `Released tokens (${index}/${ixChunks.length - 2})`,
        })
      }
      await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
      await fetchWalletTokenAccounts()
      await getOwnedDeposits({
        realmPk: realm!.pubkey,
        communityMintPk: realm!.account.communityMint,
        walletPk: wallet!.publicKey!,
        client: client!,
        connection,
      })
    } catch (ex) {
      console.error(
        "Can't withdraw tokens, go to my proposals in account view to check outstanding proposals",
        ex
      )
    }
    setIsLoading(false)
  }
  const hasTokensDeposited =
    depositRecord && depositRecord.amountDepositedNative.gt(new BN(0))
  const withdrawTooltipContent = !connected
    ? 'Connect your wallet to withdraw'
    : !hasTokensDeposited
    ? "You don't have any tokens deposited to withdraw."
    : toManyCouncilOutstandingProposalsForUse ||
      toManyCommunityOutstandingProposalsForUser
    ? "You don't have any governance tokens to withdraw."
    : ''
  return (
    <Button
      tooltipMessage={withdrawTooltipContent}
      className="sm:w-1/2"
      disabled={
        !connected ||
        !hasTokensDeposited ||
        toManyCommunityOutstandingProposalsForUser ||
        toManyCouncilOutstandingProposalsForUse ||
        isLoading ||
        wallet?.publicKey?.toBase58() !==
          ownTokenRecord?.account.governingTokenOwner.toBase58()
      }
      onClick={withdrawAllTokens}
    >
      {isLoading ? <Loading></Loading> : 'Withdraw'}
    </Button>
  )
}

export default WithDrawCommunityTokens
