/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from 'react'
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired'
import useRealm from '../hooks/useRealm'
import { getSignatoryRecordAddress, ProposalState } from '../models/accounts'
import useWalletStore from '../stores/useWalletStore'
import Button, { SecondaryButton } from './Button'

import { RpcContext } from 'models/core/api'
import { signOffProposal } from 'actions/signOffProposal'

import { finalizeVote } from 'actions/finalizeVotes'
import { Proposal } from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { cancelProposal } from 'actions/cancelProposal'
import { ProposalTransactionNotification } from './ProposalTransactionNotification'
const ProposalActionsPanel = () => {
  const { governance, proposal, proposalOwner } = useWalletStore(
    (s) => s.selectedProposal
  )
  const { realmInfo } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)
  const signatories = useWalletStore((s) => s.selectedProposal.signatories)
  const fetchProposal = useWalletStore((s) => s.actions.fetchProposal)
  const connection = useWalletStore((s) => s.connection)
  const [loadingCancel, setLoadingCancel] = useState<boolean>(false)
  const [loadingFinalize, setLoadingFinalize] = useState<boolean>(false)
  const [loadingSignoff, setLoadingSignoff] = useState<boolean>(false)
  const [errorTransaction, setErrorTransaction] = useState<string>('')

  const [signatoryRecord, setSignatoryRecord] = useState<any>(undefined)

  const canFinalizeVote =
    hasVoteTimeExpired && proposal?.info.state === ProposalState.Voting

  const walletPk = wallet?.publicKey

  useEffect(() => {
    const setup = async () => {
      if (proposal && realmInfo && walletPk) {
        const signatoryRecordPk = await getSignatoryRecordAddress(
          realmInfo.programId,
          proposal.pubkey,
          walletPk
        )

        if (signatoryRecordPk && signatories) {
          setSignatoryRecord(signatories[signatoryRecordPk.toBase58()])
        }
      }
    }

    setup()
  }, [proposal, realmInfo, walletPk])

  const canSignOff =
    signatoryRecord &&
    (proposal?.info.state === ProposalState.Draft ||
      proposal?.info.state === ProposalState.SigningOff)

  const canCancelProposal =
    proposal &&
    governance &&
    proposalOwner &&
    wallet?.publicKey &&
    proposal.info.canWalletCancel(
      governance.info,
      proposalOwner.info,
      wallet.publicKey
    )

  const signOffTooltipContent = !connected
    ? 'Connect your wallet to sign off this proposal'
    : !signatoryRecord
    ? 'Only a  signatory of the proposal can sign it off'
    : !(
        proposal?.info.state === ProposalState.Draft ||
        proposal?.info.state === ProposalState.SigningOff
      )
    ? 'Invalid proposal state. To sign off a proposal, it must be a draft or be in signing off state after creation.'
    : ''

  const cancelTooltipContent = !connected
    ? 'Connect your wallet to cancel this proposal'
    : proposal &&
      governance &&
      proposalOwner &&
      wallet?.publicKey &&
      !proposal?.info.canWalletCancel(
        governance.info,
        proposalOwner.info,
        wallet.publicKey
      )
    ? 'Only the owner of the proposal can execute this action'
    : ''

  const finalizeVoteTooltipContent = !connected
    ? 'Connect your wallet to finalize this proposal'
    : !hasVoteTimeExpired
    ? "Vote time has not expired yet. You can finalize a vote only after it's time has expired."
    : proposal?.info.state === ProposalState.Voting
    ? 'Proposal is being voting right now, you need to wait the vote to finish to be able to finalize it.'
    : ''
  const handleFinalizeVote = async () => {
    setErrorTransaction('')
    try {
      if (proposal && realmInfo && governance) {
        setLoadingFinalize(true)
        const rpcContext = new RpcContext(
          proposal.account.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        await finalizeVote(rpcContext, governance?.info.realm, proposal)

        await fetchProposal(proposal.pubkey)
        setLoadingFinalize(false)
        setErrorTransaction('success')
      }
    } catch (error) {
      setLoadingFinalize(false)
      setErrorTransaction(`${error}`)

      console.error('error finalizing vote', error)
    }
  }

  const handleSignOffProposal = async () => {
    setErrorTransaction('')
    try {
      if (proposal && realmInfo) {
        setLoadingSignoff(true)
        const rpcContext = new RpcContext(
          proposal.account.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        await signOffProposal(rpcContext, signatoryRecord)

        await fetchProposal(proposal.pubkey)
        setLoadingSignoff(false)
        setErrorTransaction('success')
      }
    } catch (error) {
      setLoadingSignoff(false)
      setErrorTransaction(`${error}`)

      console.error('error sign off', error)
    }
  }
  const handleCancelProposal = async (
    proposal: ParsedAccount<Proposal> | undefined
  ) => {
    setErrorTransaction('')
    try {
      if (proposal && realmInfo) {
        setLoadingCancel(true)
        const rpcContext = new RpcContext(
          proposal.account.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        await cancelProposal(rpcContext, proposal)

        await fetchProposal(proposal.pubkey)
        setLoadingCancel(false)
        setErrorTransaction('success')
      }
    } catch (error) {
      setLoadingCancel(false)
      setErrorTransaction(`${error}`)

      console.error('error cancelling proposal', error)
    }
  }
  return (
    <>
      {ProposalState.Cancelled === proposal?.info.state ||
      ProposalState.Succeeded === proposal?.info.state ||
      ProposalState.Defeated === proposal?.info.state ||
      (!canCancelProposal && !canSignOff && !canFinalizeVote) ? (
        <>
          {errorTransaction && (
            <div className="bg-bkg-2 rounded-lg p-6 space-y-6 flex justify-center items-center text-center flex-col w-full mt-4">
              <ProposalTransactionNotification
                details={errorTransaction}
                setDetails={setErrorTransaction}
              />
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="bg-bkg-2 rounded-lg p-6 space-y-6 flex justify-center items-center text-center flex-col w-full mt-4">
            {canSignOff && (
              <Button
                tooltipMessage={signOffTooltipContent}
                className="w-1/2"
                onClick={handleSignOffProposal}
                disabled={!connected || !canSignOff}
                isLoading={loadingSignoff}
              >
                Sign Off
              </Button>
            )}

            {canCancelProposal && (
              <SecondaryButton
                tooltipMessage={cancelTooltipContent}
                className="w-1/2"
                onClick={() => handleCancelProposal(proposal)}
                disabled={!connected || !canCancelProposal}
                isLoading={loadingCancel}
              >
                Cancel
              </SecondaryButton>
            )}

            {canFinalizeVote && (
              <Button
                tooltipMessage={finalizeVoteTooltipContent}
                className="w-1/2"
                onClick={handleFinalizeVote}
                disabled={!connected || !canFinalizeVote}
                isLoading={loadingFinalize}
              >
                Finalize
              </Button>
            )}

            <ProposalTransactionNotification
              details={errorTransaction}
              setDetails={setErrorTransaction}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ProposalActionsPanel
