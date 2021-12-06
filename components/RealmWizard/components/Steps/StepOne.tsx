import React from 'react'
import {
  RealmWizardStep,
  RealmWizardStepComponentProps,
} from '../../interfaces/Realm'
import TeamWalletField from '../TeamWalletField'
import { notify } from '@utils/notifications'
import Input from '@components/inputs/Input'
import Button from '@components/Button'

const StepOne: React.FC<RealmWizardStepComponentProps> = ({
  setForm,
  onConfirm,
  form,
}) => {
  const handleInsertTeamWallet = (wallet: string) => {
    let teamWallets: string[] = []
    if (form?.teamWallets) {
      teamWallets = form.teamWallets
    }
    if (!teamWallets.find((addr) => addr === wallet)) {
      teamWallets.push(wallet)
      setForm({ teamWallets })
    } else {
      notify({
        type: 'error',
        message: 'This wallet already exists.',
      })
    }
  }

  const handleRemoveTeamWallet = (index: number) => {
    if (form?.teamWallets && form.teamWallets[index]) {
      const teamWallets = form.teamWallets
      const removedWallet = teamWallets.splice(index, 1)
      setForm({ teamWallets })
      notify({
        type: 'success',
        message: `Wallet ${removedWallet} removed.`,
      })
    }
  }
  return (
    <>
      <h2>Name your realm</h2>
      <div className="pb-4">
        <Input
          type="text"
          value={form.name}
          placeholder="My Realm"
          onChange={($e) => {
            setForm({
              name: $e.target.value,
            })
          }}
          required
        />
      </div>
      <div className="pb-4">
        <TeamWalletField
          onInsert={handleInsertTeamWallet}
          onRemove={handleRemoveTeamWallet}
          wallets={form?.teamWallets ?? []}
        />
      </div>
      <Button
        onClick={() => onConfirm(RealmWizardStep.SELECT_MODE)}
        className="mr-3"
      >
        Previous
      </Button>
      <Button onClick={() => onConfirm(RealmWizardStep.TOKENS_CONFIG)}>
        Next
      </Button>
    </>
  )
}

export default StepOne
