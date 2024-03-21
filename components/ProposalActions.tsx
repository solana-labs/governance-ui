/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import {
  getSignatoryRecordAddress,
  ProposalState,
  serializeInstructionToBase64,
  SignatoryRecord,
} from '@solana/spl-governance'
import Button, { SecondaryButton } from './Button'

import { RpcContext } from '@solana/spl-governance'
import { signOffProposal } from 'actions/signOffProposal'
import { notify } from '@utils/notifications'
import { finalizeVote } from 'actions/finalizeVotes'
import { Proposal } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { cancelProposal } from 'actions/cancelProposal'
import { getProgramVersionForRealm } from '@models/registry/api'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import dayjs from 'dayjs'
import { diffTime } from './ProposalRemainingVotingTime'
import { useMaxVoteRecord } from '@hooks/useMaxVoteRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  proposalQueryKeys,
  useRouteProposalQuery,
} from '@hooks/queries/proposal'
import { useProposalGovernanceQuery } from '@hooks/useProposal'
import { useTokenOwnerRecordByPubkeyQuery } from '@hooks/queries/tokenOwnerRecord'
import { useAsync } from 'react-async-hook'
import { useGovernanceAccountByPubkeyQuery } from '@hooks/queries/governanceAccount'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import queryClient from '@hooks/queries/queryClient'
import useCreateProposal from '@hooks/useCreateProposal'
import { useSelectedProposalTransactions } from '@hooks/queries/proposalTransaction'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { TransactionInstruction } from '@solana/web3.js'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'

const ProposalActionsPanel = () => {
  const { propose } = useCreateProposal()
  const { fmtUrlWithCluster } = useQueryContext()
  const router = useRouter()
  const { realmInfo } = useRealm()
  const proposal = useRouteProposalQuery().data?.result
  const { data: transactions } = useSelectedProposalTransactions()
  const governance = useProposalGovernanceQuery().data?.result
  const proposalOwner = useTokenOwnerRecordByPubkeyQuery(
    proposal?.account.tokenOwnerRecord
  ).data?.result

  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)
  const connection = useLegacyConnectionContext()

  const maxVoteRecordPk = useMaxVoteRecord()?.pubkey
  const votePluginsClientMaxVoterWeight = useVotePluginsClientStore(
    (s) => s.state.maxVoterWeight
  )
  const maxVoterWeight = maxVoteRecordPk || votePluginsClientMaxVoterWeight
  const canFinalizeVote =
    hasVoteTimeExpired && proposal?.account.state === ProposalState.Voting
  const now = new Date().getTime() / 1000 // unix timestamp in seconds
  const mainVotingEndedAt = proposal?.account.signingOffAt
    ?.addn(governance?.account.config.baseVotingTime || 0)
    .toNumber()

  const votingCoolOffTime = governance?.account.config.votingCoolOffTime || 0
  const canFinalizeAt = mainVotingEndedAt
    ? mainVotingEndedAt + votingCoolOffTime
    : mainVotingEndedAt

  const canFinalizeNow = canFinalizeAt ? canFinalizeAt <= now : true
  const endOfProposalAndCoolOffTime = canFinalizeAt
    ? dayjs(1000 * canFinalizeAt!)
    : undefined
  const coolOffTimeLeft = endOfProposalAndCoolOffTime
    ? diffTime(false, dayjs(), endOfProposalAndCoolOffTime)
    : undefined

  const walletPk = wallet?.publicKey

  const { result: signatoryRecordPk } = useAsync(
    async () =>
      realmInfo === undefined ||
      proposal === undefined ||
      walletPk === undefined ||
      walletPk === null
        ? undefined
        : getSignatoryRecordAddress(
            realmInfo.programId,
            proposal.pubkey,
            walletPk
          ),
    [realmInfo, proposal, walletPk]
  )

  const signatoryRecord = useGovernanceAccountByPubkeyQuery(
    SignatoryRecord,
    'SignatoryRecord',
    signatoryRecordPk
  ).data?.result

  const canSignOff =
    signatoryRecord &&
    (proposal?.account.state === ProposalState.Draft ||
      proposal?.account.state === ProposalState.SigningOff)

  const canCancelProposal =
    proposal &&
    governance &&
    proposalOwner &&
    wallet?.publicKey &&
    proposal.account.canWalletCancel(
      governance.account,
      proposalOwner.account,
      wallet.publicKey
    )

  const canRepropose =
    proposal &&
    governance &&
    proposalOwner &&
    wallet?.publicKey &&
    ProposalState.Defeated === proposal?.account.state

  const signOffTooltipContent = !connected
    ? 'Connect your wallet to sign off this proposal'
    : !signatoryRecord
    ? 'Only a  signatory of the proposal can sign it off'
    : !(
        proposal?.account.state === ProposalState.Draft ||
        proposal?.account.state === ProposalState.SigningOff
      )
    ? 'Invalid proposal state. To sign off a proposal, it must be a draft or be in signing off state after creation.'
    : ''

  const cancelTooltipContent = !connected
    ? 'Connect your wallet to cancel this proposal'
    : proposal &&
      governance &&
      proposalOwner &&
      wallet?.publicKey &&
      !proposal?.account.canWalletCancel(
        governance.account,
        proposalOwner.account,
        wallet.publicKey
      )
    ? 'Only the owner of the proposal can execute this action'
    : ''

  const finalizeVoteTooltipContent = !connected
    ? 'Connect your wallet to finalize this proposal'
    : !hasVoteTimeExpired
    ? "Vote time has not expired yet. You can finalize a vote only after it's time has expired."
    : proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired
    ? 'Proposal is being voting right now, you need to wait the vote to finish to be able to finalize it.'
    : ''
  const handleFinalizeVote = async () => {
    try {
      if (proposal && realmInfo && governance && proposalOwner) {
        const rpcContext = new RpcContext(
          proposal.owner,
          getProgramVersionForRealm(realmInfo),
          wallet!,
          connection.current,
          connection.endpoint
        )

        await finalizeVote(
          rpcContext,
          governance?.account.realm,
          proposal,
          maxVoterWeight,
          proposalOwner
        )
      }
      queryClient.invalidateQueries({
        queryKey: proposalQueryKeys.all(connection.endpoint),
      })
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not finalize vote.`,
        description: `${error}`,
      })

      console.error('error finalizing vote', error)
    }
  }

  const handleSignOffProposal = async () => {
    try {
      if (proposal && realmInfo && signatoryRecord) {
        const rpcContext = new RpcContext(
          proposal.owner,
          getProgramVersionForRealm(realmInfo),
          wallet!,
          connection.current,
          connection.endpoint
        )

        await signOffProposal(
          rpcContext,
          realmInfo.realmId,
          proposal,
          signatoryRecord
        )
      }
      queryClient.invalidateQueries({
        queryKey: proposalQueryKeys.all(connection.endpoint),
      })
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not sign off proposal.`,
        description: `${error}`,
      })

      console.error('error sign off', error)
    }
  }
  const handleCancelProposal = async (
    proposal: ProgramAccount<Proposal> | undefined
  ) => {
    try {
      if (proposal && realmInfo && proposalOwner) {
        const rpcContext = new RpcContext(
          proposal.owner,
          getProgramVersionForRealm(realmInfo),
          wallet!,
          connection.current,
          connection.endpoint
        )

        await cancelProposal(
          rpcContext,
          realmInfo.realmId,
          proposal,
          proposalOwner
        )
      }
      queryClient.invalidateQueries({
        queryKey: proposalQueryKeys.all(connection.endpoint),
      })
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not cancel proposal.`,
        description: `${error}`,
      })

      console.error('error cancelling proposal', error)
    }
  }

  const handleRepropose = async () => {
    try {
      if (proposal && realmInfo) {
        const proposalAddress = await propose({
          title: proposal.account.name,
          description: proposal.account.descriptionLink,
          voteByCouncil:
            proposal.account.governingTokenMint !== realmInfo.communityMint,
          instructionsData: transactions
            ? [
                ...transactions.flatMap((tx) =>
                  tx.account.getAllInstructions().map(
                    (inst) =>
                      new InstructionDataWithHoldUpTime({
                        instruction: {
                          serializedInstruction: serializeInstructionToBase64(
                            new TransactionInstruction({
                              keys: inst.accounts,
                              programId: inst.programId,
                              data: Buffer.from(inst.data),
                            })
                          ),
                          isValid: true,
                          governance: undefined,
                          customHoldUpTime: tx.account.holdUpTime,
                          chunkBy: 2,
                        },
                      })
                  )
                ),
              ]
            : [],
          governance: proposal.account.governance,
        })
        const url = fmtUrlWithCluster(
          `/dao/${router.query.symbol}/proposal/${proposalAddress}`
        )
        router.push(url)
      }
      queryClient.invalidateQueries({
        queryKey: proposalQueryKeys.all(connection.endpoint),
      })
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not sign off proposal.`,
        description: `${error}`,
      })

      console.error('error sign off', error)
    }
  }
  return (
    <>
      {ProposalState.Cancelled === proposal?.account.state ||
      ProposalState.Succeeded === proposal?.account.state ||
      (!canCancelProposal &&
        !canSignOff &&
        !canFinalizeVote &&
        !canRepropose) ? null : (
        <div>
          <div className="bg-bkg-2 rounded-lg p-6 space-y-6 flex justify-center items-center text-center flex-col w-full mt-4">
            {canRepropose && (
              <Button className="w-1/2" onClick={handleRepropose}>
                Repropose
              </Button>
            )}
            {canSignOff && (
              <Button
                tooltipMessage={signOffTooltipContent}
                className="w-1/2"
                onClick={handleSignOffProposal}
                disabled={!connected || !canSignOff}
              >
                Sign Off
              </Button>
            )}

            {canCancelProposal && (
              <SecondaryButton
                tooltipMessage={cancelTooltipContent}
                className="w-1/2"
                onClick={() => handleCancelProposal(proposal)}
                disabled={!connected}
              >
                Cancel Proposal
              </SecondaryButton>
            )}

            {canFinalizeVote && (
              <>
                <Button
                  tooltipMessage={finalizeVoteTooltipContent}
                  className="w-1/2"
                  onClick={handleFinalizeVote}
                  disabled={!connected || !canFinalizeVote || !canFinalizeNow}
                >
                  Finalize
                </Button>
                {!canFinalizeNow && coolOffTimeLeft && (
                  <div>
                    Cool Off Time: {coolOffTimeLeft.days}d &nbsp;
                    {coolOffTimeLeft.hours}h &nbsp;
                    {coolOffTimeLeft.minutes}m
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ProposalActionsPanel
