import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import BN from 'bn.js'
import useRealm from '@hooks/useRealm'
import {
  getProposal,
  Governance,
  GoverningTokenType,
  ProgramAccount,
} from '@solana/spl-governance'
import { getProposalsAtVotingStateByTOR, getUnrelinquishedVoteRecords } from '@models/api'
import { withRelinquishVote } from '@solana/spl-governance'
import { withWithdrawGoverningTokens } from '@solana/spl-governance'
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
import { sendTransactionsV3, SequenceType } from '@utils/sendTransactions'
import { useState } from 'react'

// TODO make this have reasonable props
// TODO, also just refactor it
const VanillaWithdrawTokensButton = ({
  role,
}: {
  role: 'community' | 'council'
}) => {
  const [disableButton, setDisableButton] = useState(false)
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

  const vetoMint =
  role === 'community'
    ? realm?.account.config.councilMint
    : realm?.account.communityMint

  const withdrawAllTokens = async function () {
    const instructions: TransactionInstruction[] = []
    setDisableButton(true)

    try {
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

          if (voteRecord.account.vote?.veto) {
            if (vetoMint && !proposal.account.governingTokenMint.equals(vetoMint)) {
              continue;
            }
          } else {
            if (!proposal.account.governingTokenMint.equals(depositMint!)) {
              continue;
            }
          }
  
          const governance = (
            await fetchGovernanceByPubkey(
              connection,
              proposal.account.governance
            )
          ).result
  
          if (!governance) throw new Error('failed to fetch governance')
  
          if (!governance.account.realm.equals(realm!.pubkey)) {
            continue
          }
          
          if (proposal.account.getTimeToVoteEnd(governance.account) > 0) {
            notify({
              type: 'error',
              message: `Can't withdraw tokens while Proposal ${proposal.account.name} is being voted on. Please withdraw your vote first`,
            })
            throw new Error(
              `Can't withdraw tokens while Proposal ${proposal.account.name} is being voted on. Please withdraw your vote first`
            )
          } else {
            await withRelinquishVote(
              instructions,
              realmInfo!.programId,
              realmInfo!.programVersion!,
              realmInfo!.realmId,
              proposal.account.governance,
              proposal.pubkey,
              depositTokenRecord!.pubkey,
              depositMint!,
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
      }
  
      if (depositTokenRecord!.account.outstandingProposalCount > 0) {
        const activeProposals = await getProposalsAtVotingStateByTOR(
          connection,
          realmInfo!.programId,
          depositTokenRecord!.pubkey
        )
  
        for (const proposal of Object.values(activeProposals)) {
          const fetchedGovernances: ProgramAccount<Governance>[] = []
          const isGovernanceFetched = fetchedGovernances.find(governance => governance.pubkey.equals(proposal.pubkey))
  
          const currentGovernance = isGovernanceFetched ? isGovernanceFetched : (
            await fetchGovernanceByPubkey(
              connection,
              proposal.account.governance
            )
          ).result
  
          if (!currentGovernance) throw new Error('failed to fetch governance')
          
          if(fetchedGovernances.indexOf(currentGovernance) === -1) {
            fetchedGovernances.push(currentGovernance)
          }
  
          if (proposal.account.getTimeToVoteEnd(currentGovernance.account) > 0) {
            notify({
              type: 'error',
              message: `Can't withdraw tokens while Proposal ${proposal.account.name} is being voted on.`,
            })
            throw new Error(
              `Can't withdraw tokens while Proposal ${proposal.account.name} is being voted on.`
            )
          } else {
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
        const ixChunks = chunks(instructions, 8)
        for (const chunk of ixChunks.values()) {
          const txes = [chunk].map((txBatch) => {
            return {
              instructionsSet: txBatch.map((x) => {
                return {
                  transactionInstruction: x,
                }
              }),
              sequenceType: SequenceType.Sequential,
            }
          })
  
          await sendTransactionsV3({
            connection,
            wallet: wallet!,
            transactionInstructions: txes
          })
        }
        setDisableButton(false)
      } catch (ex) {
        setDisableButton(false)
        //TODO change to more friendly notification
        notify({ type: 'error', message: `${ex}` })
        console.error("Can't withdraw tokens", ex)
      }
    } catch(e) {
        setDisableButton(false)
        notify({ type: 'error', message: `${e}` })
        console.error("Can't withdraw tokens", e)
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
        disableButton ||
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
