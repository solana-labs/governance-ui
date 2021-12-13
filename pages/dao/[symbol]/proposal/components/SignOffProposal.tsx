/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FunctionComponent } from 'react'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button from '@components/Button'
import Modal from '@components/Modal'
import { SignatoryRecord } from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { signOffProposal } from 'actions/signOffProposal'
import { notify } from '@utils/notifications'
// import { useWalletSignatoryRecord } from '@hooks/useProposal'

interface SignOffProposalModalProps {
  onClose: () => void
  isOpen: boolean
  signatoryRecord?: ParsedAccount<SignatoryRecord>
}

const SignOffProposalModal: FunctionComponent<SignOffProposalModalProps> = ({
  onClose,
  isOpen,
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { proposal } = useWalletStore((s) => s.selectedProposal)
  const { realmInfo } = useRealm()

  const rpcContext = new RpcContext(
    proposal!.account.owner,
    realmInfo?.programVersion,
    wallet,
    connection.current,
    connection.endpoint
  )

  const handleSignOffProposal = async () => {
    console.log('sign off proposal', proposal)

    try {
      await signOffProposal(rpcContext, proposal)

      console.log('action sign off')
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not sign off proposal.`,
        description: `Error: ${error}`,
      })

      onClose()

      console.log('error cancel', error)
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2>Sign off proposal</h2>

      <p className="text-left mt-5 mb-8">
        Do you want to sign off this proposal?
      </p>

      <Button className="mx-2 w-44" onClick={onClose}>
        Cancel
      </Button>
      <Button className="mx-2 w-44" onClick={handleSignOffProposal}>
        Sign off
      </Button>
    </Modal>
  )
}

export default React.memo(SignOffProposalModal)
