import Modal from '@components/Modal'
import { useState } from 'react'
import Button from '@components/Button'
import GovernedAccountSelect from '../proposal/components/GovernedAccountSelect'
import {
  SetRealmAuthorityAction,
  withSetRealmAuthority,
} from '@solana/spl-governance'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { AssetAccount } from 'stores/useGovernanceAssetsStore'

const SetRealmAuthorityModal = ({
  closeModal,
  isOpen,
}: {
  closeModal: () => void
  isOpen: boolean
}) => {
  const { realmInfo, realm } = useRealm()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { fetchRealm, fetchAllRealms } = useWalletStore((s) => s.actions)
  const { assetAccounts } = useGovernanceAssets()
  const [account, setAccount] = useState<AssetAccount | null>(null)
  const [settingAuthority, setSettingAuthority] = useState(false)
  const handleSetAuthority = async () => {
    setSettingAuthority(true)
    const instructions: TransactionInstruction[] = []
    withSetRealmAuthority(
      instructions,
      realmInfo!.programId,
      realmInfo!.programVersion!,
      realm!.pubkey!,
      wallet!.publicKey!,
      account!.governance.pubkey,
      SetRealmAuthorityAction.SetChecked
    )
    const transaction = new Transaction({ feePayer: wallet!.publicKey })
    transaction.add(...instructions)
    await sendTransaction({
      transaction: transaction,
      wallet,
      connection: connection.current,
      signers: [],
      sendingMessage: `Setting authority`,
      successMessage: `Authority set`,
    })
    await fetchAllRealms(realmInfo!.programId)
    await fetchRealm(realmInfo!.programId, realmInfo!.realmId)
    setSettingAuthority(false)
    closeModal()
  }
  return (
    <Modal sizeClassName="sm:max-w-3xl" onClose={closeModal} isOpen={isOpen}>
      <div className="space-y-4 w-full">
        <h3 className="mb-4 flex flex-col">Set realm authority</h3>
      </div>
      <div>
        <GovernedAccountSelect
          label="Governance"
          governedAccounts={assetAccounts}
          onChange={(value) => {
            setAccount(value)
          }}
          value={account}
        />
      </div>
      <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
        <Button
          isLoading={settingAuthority}
          disabled={settingAuthority || !account}
          onClick={() => handleSetAuthority()}
        >
          Set authority
        </Button>
      </div>
    </Modal>
  )
}

export default SetRealmAuthorityModal
