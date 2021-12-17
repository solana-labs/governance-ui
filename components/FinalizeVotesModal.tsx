/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button, { SecondaryButton } from '@components/Button'
import { notify } from 'utils/notifications'
import Modal from '@components/Modal'
import { finalizeVote } from 'actions/finalizeVotes'
import { ParsedAccount } from '@models/core/accounts'
import { Governance, Proposal } from '@models/accounts'

type FinalizeVotesModalProps = {
  onClose: () => void
  isOpen: boolean
  governance: ParsedAccount<Governance> | undefined
  proposal: ParsedAccount<Proposal> | undefined
}

const FinalizeVotesModal = ({
  onClose,
  isOpen,
  governance,
  proposal,
}: FinalizeVotesModalProps) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm)
  const { realmInfo } = useRealm()

  const handleFinalizeVote = async () => {
    try {
      if (proposal && realmInfo && governance) {
        const rpcContext = new RpcContext(
          proposal.account.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        await finalizeVote(rpcContext, governance?.info.realm, proposal)

        onClose()

        await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
      }
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not finalize vote.`,
      })

      onClose()

      console.log('error finalizing vote', error)
    }
  }

  return (
    <>
      <Modal onClose={onClose} isOpen={isOpen}>
        <h2>Finalize votes</h2>

        <p className="text-left mt-5 mb-8">Do you want to finalize vote?</p>

        <div className="flex items-center justify-center">
          <SecondaryButton className="w-44 mr-4" onClick={onClose}>
            No
          </SecondaryButton>

          <Button className="w-44" onClick={handleFinalizeVote}>
            Finalize
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default FinalizeVotesModal
