import React, { useState } from 'react'
import Textarea from '@components/inputs/Textarea'
import Modal from '@components/Modal'
import Button from '@components/Button'
import { publicKeyValidationTest } from '../validators/create-realm-validator'

const AddWalletModal: React.FC<{
  onOk: (wallets: string[]) => void
  onClose: () => void
  isOpen: boolean
}> = ({ isOpen = false, onOk, onClose }) => {
  const [walletAddr, setWalletAddr] = useState('')
  const [hasErrors, setErrors] = useState<string[]>()

  const handleAddWallet = () => {
    const wallets = walletAddr.replace(' ', '').split(/,|\n/gim)
    const errors: string[] = []
    wallets.forEach((wallet, index) => {
      if (!publicKeyValidationTest(wallet)) {
        errors.push(
          `Entry ${index + 1} (${wallet.substr(
            0,
            8
          )}...)  is not a valid public key.`
        )
      }
    })
    if (errors.length) setErrors(errors)
    else {
      onClose()
      setWalletAddr('')
      onOk(wallets)
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
          <Textarea
            placeholder="Public keys separated by coma or line break"
            value={walletAddr}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              if (hasErrors) setErrors(undefined)
              setWalletAddr(e.target.value)
            }}
          />
          {!!hasErrors && (
            <p className="text-red w-full ml-3">
              {hasErrors.map((error, index) => (
                <div className="mb-2" key={index}>
                  {error}
                  <br />
                </div>
              ))}
            </p>
          )}
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
