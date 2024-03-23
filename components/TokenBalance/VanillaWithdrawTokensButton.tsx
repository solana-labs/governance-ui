import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import BN from 'bn.js'
import useRealm from '@hooks/useRealm'
import {
  getProposal,
  GoverningTokenType,
  ProposalState,
} from '@solana/spl-governance'
import { getUnrelinquishedVoteRecords } from '@models/api'
import { withRelinquishVote } from '@solana/spl-governance'
import { withWithdrawGoverningTokens } from '@solana/spl-governance'
import { sendTransaction } from '@utils/send'
import { SecondaryButton } from '../Button'
import { withFinalizeVote } from '@solana/spl-governance'
import { chunks } from '@utils/helpers'
import { getProgramVersionForRealm } from '@models/registry/api'
import { notify } from '@utils/notifications'
import { useMaxVoteRecord } from '@hooks/useMaxVoteRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { fetchGovernanceByPubkey } from '@hooks/queries/governance'
import { useConnection } from '@solana/wallet-adapter-react'
import queryClient from '@hooks/queries/queryClient'
import { proposalQueryKeys } from '@hooks/queries/proposal'
import asFindable from '@utils/queries/asFindable'
import { fetchTokenAccountByPubkey } from '@hooks/queries/tokenAccount'
import {useVotingClients} from "@hooks/useVotingClients";

// TODO make this have reasonable props
// TODO, also just refactor it
const VanillaWithdrawTokensButton = ({
  role,
}: {
  role: 'community' | 'council'
}) => {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { connection } = useConnection()
  const maxVoterWeight = useMaxVoteRecord()?.pubkey || undefined
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const votingClient = useVotingClients()(role);

  const relevantTokenConfig =
    role === 'community'
      ? config?.account.communityTokenConfig
      : config?.account.councilTokenConfig
  const isMembership =
    relevantTokenConfig?.tokenType === GoverningTokenType.Membership

  const {
    realmInfo,
    realmTokenAccount,
    councilTokenAccount,
    toManyCommunityOutstandingProposalsForUser,
    toManyCouncilOutstandingProposalsForUse,
  } = useRealm()

  const depositTokenRecord =
    role === 'community' ? ownTokenRecord : ownCouncilTokenRecord

  const depositTokenAccount =
    role === 'community' ? realmTokenAccount : councilTokenAccount

  const depositMint =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const withdrawAllTokens = async function () {
    const instructions: TransactionInstruction[] = []
    // If there are unrelinquished votes for the voter then let's release them in the same instruction as convenience
    if (depositTokenRecord!.account!.unrelinquishedVotesCount > 0) {
      const voteRecords = await getUnrelinquishedVoteRecords(
        connection,
        realmInfo!.programId,
        depositTokenRecord!.account!.governingTokenOwner
      )

      for (const voteRecord of Object.values(voteRecords)) {
        const proposalQuery = await queryClient.fetchQuery({
          queryKey: proposalQueryKeys.byPubkey(
            connection.rpcEndpoint,
            voteRecord.account.proposal
          ),
          staleTime: 0,
          queryFn: () =>
            asFindable(() =>
              getProposal(connection, voteRecord.account.proposal)
            )(),
        })
        const proposal = proposalQuery.result
        if (!proposal) {
          continue
        }

        if (proposal.account.state === ProposalState.Voting) {
          if (proposal.account.state === ProposalState.Voting) {
            const governance = (
              await fetchGovernanceByPubkey(
                connection,
                proposal.account.governance
              )
            ).result
            if (!governance) throw new Error('failed to fetch governance')
            if (
              proposal.account.getTimeToVoteEnd(governance.account) > 0 &&
              governance.account.realm.equals(realm!.pubkey)
            ) {
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
          realmInfo!.programVersion!,
          realmInfo!.realmId,
          proposal.account.governance,
          proposal.pubkey,
          depositTokenRecord!.pubkey,
          proposal.account.governingTokenMint,
          voteRecord.pubkey,
          depositTokenRecord!.account.governingTokenOwner,
          wallet!.publicKey!
        )
        await votingClient.withRelinquishVote(
          instructions,
          proposal,
          voteRecord.pubkey,
          depositTokenRecord!.pubkey
        )
      }
    }

    const ataPk = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      depositMint!,
      wallet!.publicKey!,
      true
    )
    const ata = await fetchTokenAccountByPubkey(connection, ataPk)

    if (!ata.found) {
      const ataIx = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        depositMint!,
        ataPk,
        wallet!.publicKey!,
        wallet!.publicKey! // fee payer
      )
      instructions.push(ataIx)
    }

    await withWithdrawGoverningTokens(
      instructions,
      realmInfo!.programId,
      realmInfo!.programVersion!,
      realm!.pubkey,
      depositTokenAccount?.publicKey
        ? depositTokenAccount!.publicKey
        : new PublicKey(ataPk),
      depositTokenRecord!.account.governingTokenMint,
      wallet!.publicKey!
    )

    // Force the UI to recalculate voter weight
    queryClient.invalidateQueries({
      queryKey: ['calculateVoterWeight'],
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
    } catch (ex) {
      //TODO change to more friendly notification
      notify({ type: 'error', message: `${ex}` })
      console.error("Can't withdraw tokens", ex)
    }
  }

  const hasTokensDeposited =
    depositTokenRecord &&
    depositTokenRecord.account.governingTokenDepositAmount.gt(new BN(0))

  const withdrawTooltipContent = !connected
    ? 'Connect your wallet to withdraw'
    : !hasTokensDeposited
    ? "You don't have any tokens deposited to withdraw."
    : role === 'community' &&
      (toManyCouncilOutstandingProposalsForUse ||
        toManyCommunityOutstandingProposalsForUser)
    ? 'You have to many outstanding proposals to withdraw.'
    : ''

  return (
    <SecondaryButton
      tooltipMessage={withdrawTooltipContent}
      className="sm:w-1/2 max-w-[200px]"
      disabled={
        isMembership ||
        !connected ||
        !hasTokensDeposited ||
        (role === 'community' && toManyCommunityOutstandingProposalsForUser) ||
        toManyCouncilOutstandingProposalsForUse ||
        wallet?.publicKey?.toBase58() !==
          depositTokenRecord.account.governingTokenOwner.toBase58()
      }
      onClick={withdrawAllTokens}
    >
      Withdraw
    </SecondaryButton>
  )
}
export default VanillaWithdrawTokensButton
