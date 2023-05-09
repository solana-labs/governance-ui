import React, { useState } from 'react'
import Modal from '@components/Modal'
import Button, { SecondaryButton } from '@components/Button'
import { notify } from '@utils/notifications'

export interface PromptModalProps {
  isOpen: boolean
  title?: string
  message: string
  type?: 'success' | 'info' | 'error'
  onClose: () => void
  closeBtnText?: string
  onConfirm?: () => Promise<void>
  confirmBtnText?: string
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  message,
  title = '',
  type = 'success',
  onClose,
  closeBtnText = 'Close',
  onConfirm,
  confirmBtnText = 'Confirm',
}) => {
  const [confirming, setConfirming] = useState(false)
  const handleOnConfirm = async () => {
    setConfirming(true)

    try {
      await onConfirm!()
    } catch (e) {
      notify({
        type: 'error',
        message: e.message || 'Unable to confirm',
      })
    }
  }

  const textClass = {
    success: 'text-green',
    info: 'text-primary',
    error: 'text-red',
  }[type]

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="bg-bkg-3 rounded-md w-full p-4 mb-4 font-normal text-sm">
        <div>{title}</div>
        <br />
        <div className={`text-xs ${textClass}`}>{message}</div>
      </div>
      <div className="flex flex-col pt-4">
        {onConfirm ? (
          <Button
            className="mb-4"
            onClick={handleOnConfirm}
            isLoading={confirming}
            disabled={confirming}
          >
            {confirmBtnText}
          </Button>
        ) : null}
        <SecondaryButton onClick={onClose}>{closeBtnText}</SecondaryButton>
      </div>
    </Modal>
  )
}
