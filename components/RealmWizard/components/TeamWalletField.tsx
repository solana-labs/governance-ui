import React, { useEffect, useState } from 'react'
import { StyledLabel } from '@components/inputs/styles'
import AddWalletModal from './AddWalletModal'
import { TrashIcon } from '@heroicons/react/solid'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useWalletStore from 'stores/useWalletStore'
import { notify } from '@utils/notifications'

const TeamWalletField: React.FC<{
  onInsert: (wallets: string[]) => void
  onRemove: (index: number) => void
  wallets?: string[]
}> = ({ wallets = [], onInsert, onRemove }) => {
  const [showAddWalletModal, setShowWalletModal] = useState(false)
  const { current: wallet } = useWalletStore((s) => s)

  const newWalletButton = (
    <div
      className="add-wallet-btn pointer pt-1.5 w-10 h-10 mt-4 flex justify-center align-center"
      onClick={() => {
        setShowWalletModal(true)
      }}
    >
      <PlusCircleIcon />
    </div>
  )

  const handleRemoveWallet = (index: number) => {
    if (wallets[index] === wallet?.publicKey?.toBase58())
      notify({
        type: 'info',
        message: 'Current wallet is required.',
      })
    else onRemove(index)
  }

  useEffect(() => {
    if (
      wallet?.publicKey &&
      !wallets.find((addr) => addr === wallet.publicKey?.toBase58())
    ) {
      onInsert([wallet.publicKey?.toBase58()])
    }
  }, [wallets.length, wallet?.publicKey])

  return (
    <div className="team-wallets-wrapper">
      <StyledLabel>Team wallets</StyledLabel>
      {wallets.map((wallet, index) => (
        <div className="flex flex-col relative w-full" key={index}>
          <StyledLabel>Member {index + 1}:</StyledLabel>
          <div className="flex align-center">
            <div className="bg-gray-700 px-3 py-2 rounded">{wallet}</div>
            <TrashIcon
              className="mt-3 ml-3 h-5 text-red pointer"
              onClick={() => {
                handleRemoveWallet(index)
              }}
            />
          </div>
        </div>
      ))}

      <AddWalletModal
        isOpen={showAddWalletModal}
        onOk={onInsert}
        onClose={() => {
          setShowWalletModal(false)
        }}
      />
      {newWalletButton}
    </div>
  )
}

export default TeamWalletField
