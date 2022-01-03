import React from 'react'
import { RpcContext } from 'models/core/api'
import useWalletStore from 'stores/useWalletStore'
import useRealm from 'hooks/useRealm'
import Button, { SecondaryButton } from '@components/Button'
import Modal from '@components/Modal'
import { ParsedAccount } from 'models/core/accounts'
import { signOffProposal } from 'actions/signOffProposal'
import { notify } from '@utils/notifications'
import useProposal from '@hooks/useProposal'
import { SignatoryRecord } from '@models/accounts'

type SignOffProposalModalProps = {
  onClose: () => void
  isOpen: boolean
  signatoryRecord: ParsedAccount<SignatoryRecord>
}

const SignOffProposalModal = ({
  onClose,
  isOpen,
  signatoryRecord,
}: SignOffProposalModalProps) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const fetchProposal = useWalletStore((s) => s.actions.fetchProposal)
  const { realmInfo } = useRealm()
  const { proposal } = useProposal()

  const handleSignOffProposal = async () => {
    try {
      if (proposal && realmInfo) {
        const rpcContext = new RpcContext(
          proposal.account.owner,
          realmInfo?.programVersion,
          wallet,
          connection.current,
          connection.endpoint
        )

        await signOffProposal(rpcContext, signatoryRecord)

        onClose()

        await fetchProposal(proposal.pubkey)
      }
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
      {signatoryRecord ? (
        <>
          {signatoryRecord.info.signedOff && <h2>Signed</h2>}

          {!signatoryRecord.info.signedOff && (
            <>
              <h2>Sign off proposal</h2>

              <p className="text-left mt-5 mb-8">
                Do you want to sign off this proposal?
              </p>

              <div className="flex items-center justify-center">
                <SecondaryButton className="w-44 mr-4" onClick={onClose}>
                  No
                </SecondaryButton>

                <Button className="mx-2 w-44" onClick={handleSignOffProposal}>
                  Sign off
                </Button>
              </div>
            </>
          )}
        </>
      ) : null}
    </Modal>
  )
}

export default SignOffProposalModal
