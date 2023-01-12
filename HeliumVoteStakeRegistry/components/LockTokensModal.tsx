import React from 'react'
import Modal from '@components/Modal'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'

export const LockTokensModal: React.FC<{
  onClose: () => void
  isOpen: boolean
}> = ({ onClose, isOpen = false }) => {
  const { mint, realm, realmTokenAccount, realmInfo, tokenRecords } = useRealm()
  const [wallet, connection, endpoint] = useWalletStore((s) => [
    s.current,
    s.connection.current,
    s.connection.endpoint,
  ])
  const [
    vsrClient,
    vsrRegistrar,
    vsrRegistrarPk,
  ] = useVotePluginsClientStore((s) => [
    s.state.vsrClient,
    s.state.voteStakeRegistryRegistrar,
    s.state.voteStakeRegistryRegistrarPk,
  ])

  console.log(vsrClient)
  console.log(vsrRegistrar)
  console.log(vsrRegistrarPk)
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2 className="mb-4 flex flex-row items-center">Lock Tokens</h2>
    </Modal>
  )
}
