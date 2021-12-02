import React, { useEffect, useState } from 'react'
import { inputClasses, StyledLabel } from '@components/inputs/styles'
import Modal from '@components/Modal'
import Input from '@components/inputs/Input'
import AddWalletModal from './AddWalletModal'
import { TrashIcon } from '@heroicons/react/solid'
import { PlusCircleIcon } from '@heroicons/react/outline'

const TeamWalletField: React.FC<{
  onInsert: (wallet: string) => void
  onRemove: (index: number) => void
  wallets?: string[]
}> = ({ wallets = [], onInsert, onRemove }) => {
  const [showAddWalletModal, setShowWalletModal] = useState(false)

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

  return (
    <div className="team-wallets-wrapper">
      <StyledLabel>Team wallet addresses</StyledLabel>
      {wallets.map((wallet, index) => (
        <div className="flex flex-col relative w-full" key={index}>
          <StyledLabel>Member {index + 1}:</StyledLabel>
          <div className="flex align-center">
            <div className="bg-gray-700 px-3 py-2 rounded">{wallet}</div>
            <TrashIcon
              className="mt-3 ml-3 h-5 text-red pointer"
              onClick={() => {
                onRemove(index)
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
