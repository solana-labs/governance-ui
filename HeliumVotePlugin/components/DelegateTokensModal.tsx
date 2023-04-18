import React, { useState, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import Modal from '@components/Modal'
import Button, { SecondaryButton } from '@components/Button'
import { notify } from '@utils/notifications'
import { SubDaoWithMeta } from 'HeliumVotePlugin/sdk/types'
import { useSubDaos } from 'HeliumVotePlugin/hooks/useSubDaos'
import { LoadingDots } from '@components/Loading'

export interface DelegateTokensModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (subDao: SubDaoWithMeta) => Promise<void>
}

export const DelegateTokensModal: React.FC<DelegateTokensModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { loading, error, result: subDaos } = useSubDaos()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSubDaoPk, setSelectedSubDaoPk] = useState<PublicKey | null>(
    null
  )

  useEffect(() => {
    if (error) {
      notify({
        type: 'error',
        message: error.message || 'Unable to fetch subdaos',
      })
    }
  }, [error])

  const handleOnSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onSubmit(
        subDaos!.find((subDao) => subDao.pubkey.equals(selectedSubDaoPk!))!
      )
      onClose()
    } catch (e) {
      setIsSubmitting(false)
      notify({
        type: 'error',
        message: e.message || 'Unable to delegate tokens',
      })
    }
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <h2 className="mb-4 flex flex-row items-center">Delegate Tokens</h2>
      {loading ? (
        <>
          <div className="bg-bkg-3 rounded-md w-full p-4 mb-4 font-normal text-xs">
            <div>Fetching Delegatable SubDaos</div>
          </div>
          <div className="p-4">
            <LoadingDots />
          </div>
        </>
      ) : (
        <div className="bg-bkg-3 rounded-md w-full p-4 mb-4 font-normal text-xs">
          <div>Select an existing subdao too delegate too</div>
          <br />
          <div>
            Once delegated, you can&apos;t perform any actions on this position until
            you undelegate
          </div>
          <div className="w-full flex flex-col gap-2 pt-4">
            {subDaos?.map((subDao) => {
              const isSelected = selectedSubDaoPk?.equals(subDao.pubkey)

              return (
                <div
                  className={`border rounded-md flex flex-row items-center gap-3 w-full p-4 hover:border-fgd-3 hover:bg-bkg-3 hover:cursor-pointer ${
                    isSelected ? 'bg-bkg-3 border-fgd-3' : 'border-fgd-4'
                  }`}
                  onClick={() => setSelectedSubDaoPk(subDao.pubkey)}
                  key={subDao.pubkey.toBase58()}
                >
                  <img
                    className="w-5 h-5"
                    src={subDao.dntMetadata.json?.image}
                  />
                  {subDao.dntMetadata.name}
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="flex flex-col pt-4">
        <Button
          className="mb-4"
          onClick={handleOnSubmit}
          isLoading={isSubmitting}
          disabled={!selectedSubDaoPk || isSubmitting}
        >
          Delegate Tokens
        </Button>
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
      </div>
    </Modal>
  )
}
