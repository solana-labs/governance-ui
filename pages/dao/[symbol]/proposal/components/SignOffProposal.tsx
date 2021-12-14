/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FunctionComponent } from 'react'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button from '@components/Button'
import Modal from '@components/Modal'
import { ParsedAccount } from 'models/core/accounts'
import { signOffProposal } from 'actions/signOffProposal'
import { notify } from '@utils/notifications'
import useProposal from '@hooks/useProposal'
import { SignatoryRecord } from '@models/accounts'

interface SignOffProposalModalProps {
  onClose: () => void
  isOpen: boolean
  signatoryRecord?: ParsedAccount<SignatoryRecord>
}

const SignOffProposalModal: FunctionComponent<SignOffProposalModalProps> = ({
  onClose,
  isOpen,
  signatoryRecord,
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()
  const { proposal } = useProposal()

  const rpcContext = new RpcContext(
    proposal!.account.owner,
    realmInfo?.programVersion,
    wallet,
    connection.current,
    connection.endpoint
  )

  const handleSignOffProposal = async () => {
    try {
      await signOffProposal(rpcContext, signatoryRecord)
    } catch (error) {
      notify({
        type: 'error',
        message: `Error: Could not sign off proposal.`,
        description: `Error: ${error}`,
      })

      onClose()

      console.log('error sign off', error)
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      {signatoryRecord!.info.signedOff && <h2>Signed</h2>}

      {!signatoryRecord!.info.signedOff && (
        <>
          <h2>Sign off proposal</h2>

          <p className="text-left mt-5 mb-8">
            Do you want to sign off this proposal?
          </p>

          <div className="flex items-center justify-center">
            <Button className="mx-2 w-44" onClick={onClose}>
              Cancel
            </Button>

            <Button className="mx-2 w-44" onClick={handleSignOffProposal}>
              Sign off
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}

export default React.memo(SignOffProposalModal)
