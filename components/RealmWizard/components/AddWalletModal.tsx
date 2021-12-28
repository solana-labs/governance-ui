import React, { useState } from 'react'
import Textarea from '@components/inputs/Textarea'
import Modal from '@components/Modal'
import Button, { SecondaryButton } from '@components/Button'
import { publicKeyValidationTest } from '../validators/createRealmValidator'

const AddWalletModal: React.FC<{
  onOk: (wallets: string[]) => void
  onClose: () => void
  isOpen: boolean
}> = ({ isOpen = false, onOk, onClose }) => {
  const [walletAddr, setWalletAddr] = useState('')
  const [hasErrors, setErrors] = useState<string[]>()

  const handleAddWallet = () => {
    const wallets = walletAddr.replace(/ +/gim, '').split(/,|\n/gim)
    const errors: string[] = []
    const parsedWallets: string[] = []
    wallets.forEach((wallet, index) => {
      if (wallet.length) {
        parsedWallets.push(wallet)
        if (!publicKeyValidationTest(wallet)) {
          errors.push(
            `Entry ${index + 1} (${wallet.substr(
              0,
              8
            )}...)  is not a valid public key.`
          )
        }
      }
    })
    if (errors.length) setErrors(errors)
    else {
      onClose()
      setWalletAddr('')
      onOk(parsedWallets)
    }
  }

  const getAddMembersText = () => {
    let message = 'Add Member'
    const wallets = walletAddr.split(/\n/)
    if (wallets.length > 1 && wallets[1].length > 1) message += 's'
    return message
  }

  return (
    <>
      {isOpen && (
        <Modal
          sizeClassName="sm:max-w-lg"
          isOpen={isOpen}
          onClose={() => {
            setWalletAddr('')
            onClose()
          }}
        >
          <h2>Team members wallets</h2>
          <Textarea
            rows={10}
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
            <SecondaryButton
              onClick={() => {
                onClose()
              }}
            >
              Cancel
            </SecondaryButton>
            <Button
              disabled={!walletAddr.length}
              className="ml-4"
              onClick={handleAddWallet}
            >
              {getAddMembersText()}
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default AddWalletModal
