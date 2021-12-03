import React, { useState } from 'react'
import Input from '@components/inputs/Input'
import Modal from '@components/Modal'
import Button from '@components/Button'
import { publicKeyValidationTest } from '../validators/create-realm-validator'

const AddWalletModal: React.FC<{
  onOk: (walletAddr: string) => void
  onClose: () => void
  isOpen: boolean
}> = ({ isOpen = false, onOk, onClose }) => {
  const [walletAddr, setWalletAddr] = useState('')
  const [hasErrors, setErrors] = useState<string>()

  const handleAddWallet = () => {
    if (publicKeyValidationTest(walletAddr)) {
      onOk(walletAddr)
      setWalletAddr('')
      onClose()
    } else {
      setErrors('Wallet address is not a valid public key.')
    }
  }

  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => {
            setWalletAddr('')
            onClose()
          }}
        >
          <h2>Add a teammate wallet</h2>
          <Input
            placeholder="Public Wallet"
            value={walletAddr}
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (hasErrors) setErrors(undefined)
              setWalletAddr(e.target.value)
            }}
          />
          {!!hasErrors && <p className="text-red w-full ml-3">{hasErrors}</p>}
          <br />
          <div className="text-right mt-3">
            <Button
              onClick={() => {
                onClose()
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!walletAddr.length}
              className="ml-4"
              onClick={handleAddWallet}
            >
              Ok
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default AddWalletModal
