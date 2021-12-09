import React, { useEffect, useState } from 'react'
import { inputClasses, StyledLabel } from '@components/inputs/styles'
import Modal from '@components/Modal'
import Input from '@components/inputs/Input'
import AddWalletModal from './AddWalletModal'
import { TrashIcon } from '@heroicons/react/solid'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useWalletStore from 'stores/useWalletStore'

const TeamWalletField: React.FC<{
  onInsert: (wallet: string) => void
  onRemove: (index: number) => void
  wallets?: string[]
}> = ({ wallets = [], onInsert, onRemove }) => {
  const [showAddWalletModal, setShowWalletModal] = useState(false)
  const { current: wallet } = useWalletStore((s) => s)
  const [hasCurrentWallet, setHasCurrentWallet] = useState(false)

  const includeCurrentWalletButton = (
    <label>
      <input
        className="mr-1 mt-4"
        type="checkbox"
        checked={hasCurrentWallet}
        onChange={(e) => {
          if (wallet?.publicKey) {
            if (e.target.checked) {
              setHasCurrentWallet(true)
              onInsert(wallet?.publicKey.toBase58())
            } else {
              const currentWalletIndex = wallets.findIndex(
                (addr) => addr === wallet?.publicKey?.toBase58()
              )
              setHasCurrentWallet(false)
              onRemove(currentWalletIndex)
            }
          }
        }}
      />
      <small> Include current wallet</small>
    </label>
  )

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

  useEffect(() => {
    if (
      wallet &&
      wallets.find((addr) => addr === wallet.publicKey?.toBase58())
    ) {
      setHasCurrentWallet(true)
    }
  }, [wallets.length, wallet?.publicKey])

  return (
    <div className="team-wallets-wrapper">
      <StyledLabel>Team wallets</StyledLabel>
      {includeCurrentWalletButton}
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
