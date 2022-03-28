import Modal from '@components/Modal'
import { useState } from 'react'
import Button from '@components/Button'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import GovernedAccountSelect from '../proposal/components/GovernedAccountSelect'

const SetRealmAuthorityModal = ({
  closeModal,
  isOpen,
}: {
  closeModal: () => void
  isOpen: boolean
}) => {
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const [governance, setGovernnace] = useState(null)
  const [settingAuthority, setSettingAuthority] = useState(false)
  const handleSetAuthority = () => {
    setSettingAuthority(true)
    setSettingAuthority(false)
  }
  return (
    <Modal sizeClassName="sm:max-w-3xl" onClose={closeModal} isOpen={isOpen}>
      <div className="space-y-4 w-full">
        <h3 className="mb-4 flex flex-col">Set realm authority</h3>
      </div>
      <div>
        <GovernedAccountSelect
          label="Governance"
          governedAccounts={governedMultiTypeAccounts}
          onChange={(value) => {
            setGovernnace(value)
          }}
          value={governance}
          governance={governance}
        />
      </div>
      <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
        <Button
          isLoading={settingAuthority}
          disabled={settingAuthority || !governance}
          onClick={() => handleSetAuthority()}
        >
          Set authority
        </Button>
      </div>
    </Modal>
  )
}

export default SetRealmAuthorityModal
