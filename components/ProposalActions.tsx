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
import Loading from './Loading'
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
  const [loading, setLoading] = useState<boolean>(false)

  const [errorTransaction, setErrorTransaction] = useState<string>('')
  const [txIdHash, setTxIdHash] = useState<string>('')
  const [signatoryRecord, setSignatoryRecord] = useState<any>(undefined)

  const canFinalizeVote =
    hasVoteTimeExpired && proposal?.account.state === ProposalState.Voting

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
    : proposal?.account.state === ProposalState.Voting
    ? 'Proposal is being voting right now, you need to wait the vote to finish to be able to finalize it.'
    : ''
  const handleFinalizeVote = async () => {
    setErrorTransaction('')
    try {
      if (proposal && realmInfo && governance) {
        setLoading(true)
        const rpcContext = new RpcContext(
          proposal.data.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        const txId = await finalizeVote(
          rpcContext,
          governance?.account.realm,
          proposal
        )
        setTxIdHash(txId)
        await fetchProposal(proposal.pubkey)
        setLoading(false)
        setErrorTransaction('success')
      }
    } catch (error) {
      setLoading(false)
      setErrorTransaction(`${error}`)

      console.error('error finalizing vote', error)
    }
  }

  const handleSignOffProposal = async () => {
    setErrorTransaction('')
    try {
      if (proposal && realmInfo) {
        setLoading(true)
        const rpcContext = new RpcContext(
          proposal.data.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        const txId = await signOffProposal(rpcContext, signatoryRecord)
        setTxIdHash(txId)
        await fetchProposal(proposal.pubkey)
        setLoading(false)
        setErrorTransaction('success')
      }
    } catch (error) {
      setLoading(false)
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
        setLoading(true)
        const rpcContext = new RpcContext(
          proposal.data.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        const txId = await cancelProposal(rpcContext, proposal)
        setTxIdHash(txId)
        await fetchProposal(proposal.pubkey)
        setLoading(false)
        setErrorTransaction('success')
      }
    } catch (error) {
      setLoading(false)
      setErrorTransaction(`${error}`)

      console.error('error cancelling proposal', error)
    }
  }
  return (
    <>
      {ProposalState.Cancelled === proposal?.account.state ||
      ProposalState.Succeeded === proposal?.account.state ||
      ProposalState.Defeated === proposal?.account.state ||
      (!canCancelProposal && !canSignOff && !canFinalizeVote) ? (
        <>
          {errorTransaction && (
            <div className="bg-bkg-2 rounded-lg p-6 space-y-6 flex justify-center items-center text-center flex-col w-full mt-4">
              <ProposalTransactionNotification
                details={errorTransaction}
                setDetails={setErrorTransaction}
                txIdHash={txIdHash}
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
                disabled={
                  !connected || !canSignOff || !!errorTransaction || loading
                }
              >
                Sign Off
              </Button>
            )}

            {canCancelProposal && (
              <SecondaryButton
                tooltipMessage={cancelTooltipContent}
                className="w-1/2"
                onClick={() => handleCancelProposal(proposal)}
                disabled={
                  !connected ||
                  !canCancelProposal ||
                  !!errorTransaction ||
                  loading
                }
              >
                Cancel
              </SecondaryButton>
            )}

            {canFinalizeVote && (
              <Button
                tooltipMessage={finalizeVoteTooltipContent}
                className="w-1/2"
                onClick={handleFinalizeVote}
                disabled={
                  !connected ||
                  !canFinalizeVote ||
                  !!errorTransaction ||
                  loading
                }
              >
                Finalize
              </Button>
            )}
            {loading ? <Loading className="h-8 w-8 mt-9"></Loading> : null}
            <ProposalTransactionNotification
              details={errorTransaction}
              setDetails={setErrorTransaction}
              txIdHash={txIdHash}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ProposalActionsPanel
