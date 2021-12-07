import React from 'react'
import { RealmWizardStepComponentProps } from '../../interfaces/Realm'
import TeamWalletField from '../TeamWalletField'
import { notify } from '@utils/notifications'
import Input from '@components/inputs/Input'

/**
 * This is the Step One for the Realm Wizard.
 *
 * This step will set up the Realm name and the team member wallets.
 * Then the parent should trigger the contracts creation.
 *
 * @param param0 the form data and form handler.
 */
const StepOne: React.FC<RealmWizardStepComponentProps> = ({
  setForm,
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
          required
          type="text"
          value={form.name}
          placeholder="My Realm"
          onChange={($e) => {
            setForm({
              name: $e.target.value,
            })
          }}
        />
      </div>
      <div className="pb-4">
        <TeamWalletField
          onInsert={handleInsertTeamWallet}
          onRemove={handleRemoveTeamWallet}
          wallets={form?.teamWallets ?? []}
        />
      </div>
    </>
  )
}

export default StepOne
