import React from 'react'
import { RealmWizardStepComponentProps } from '../../interfaces/Realm'
import TeamWalletField from '../TeamWalletField'
import Input from '@components/inputs/Input'
import { StyledLabel } from '@components/inputs/styles'

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
  const handleInsertTeamWallet = (wallets: string[]) => {
    let teamWallets: string[] = []
    if (form?.teamWallets) {
      teamWallets = form.teamWallets
    }
    wallets.forEach((wallet) => {
      if (!teamWallets.find((addr) => addr === wallet)) {
        teamWallets.push(wallet)
        setForm({ teamWallets })
      }
    })
  }

  const handleRemoveTeamWallet = (index: number) => {
    if (form?.teamWallets && form.teamWallets[index]) {
      const teamWallets = form.teamWallets
      teamWallets.splice(index, 1)
      setForm({ teamWallets })
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
        <StyledLabel>Vote Threshold (%)</StyledLabel>
        <Input
          required
          type="number"
          value={form.yesThreshold}
          placeholder="Vote threshold"
          onChange={($e) => {
            if (+$e.target.value > 0 && +$e.target.value <= 100)
              setForm({
                yesThreshold: $e.target.value,
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
