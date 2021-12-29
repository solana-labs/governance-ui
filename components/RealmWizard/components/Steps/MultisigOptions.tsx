import React, { useEffect } from 'react'
import { RealmWizardStepComponentProps } from '../../interfaces/Realm'
import TeamWalletField from '../TeamWalletField'
import Input from '@components/inputs/Input'
import { StyledLabel } from '@components/inputs/styles'
import AmountSlider from '@components/Slider'
import useWalletStore from 'stores/useWalletStore'

/**
 * This is the Step One for the Realm Wizard.
 *
 * This step will set up the Realm name and the team member wallets.
 * Then the parent should trigger the contracts creation.
 *
 * @param param0 the form data and form handler.
 */
const MultisigOptions: React.FC<RealmWizardStepComponentProps> = ({
  setForm,
  form,
}) => {
  const DEFAULT_APPROVAL_QUORUM = 60
  const { current: wallet } = useWalletStore((s) => s)

  const handleInsertTeamWallet = (wallets: string[]) => {
    const teamWallets: string[] = form?.teamWallets ?? []

    wallets.forEach((wallet) => {
      if (!teamWallets.find((addr) => addr === wallet)) {
        teamWallets.push(wallet)
      }
    })
    setForm({ teamWallets })
  }

  const handleRemoveTeamWallet = (index: number) => {
    if (form?.teamWallets && form.teamWallets[index]) {
      const teamWallets = form.teamWallets
      teamWallets.splice(index, 1)
      setForm({ teamWallets })
    }
  }

  const addCurrentWallet = () => {
    if (wallet?.publicKey) {
      handleInsertTeamWallet([wallet.publicKey?.toBase58()])
    }
  }

  useEffect(() => {
    addCurrentWallet()
  }, [wallet?.publicKey])

  useEffect(() => {
    addCurrentWallet()
  }, [])

  return (
    <div>
      <div className="pb-4 my-5 pr-10 w-full" style={{ maxWidth: 512 }}>
        <StyledLabel>Name your realm</StyledLabel>
        <Input
          required
          type="text"
          value={form.name}
          placeholder="The name of your realm"
          onChange={($e) => {
            setForm({
              name: $e.target.value,
            })
          }}
        />
      </div>
      <div className="pb-7 pr-10 w-full" style={{ maxWidth: 512 }}>
        <StyledLabel>Approval quorum (%)</StyledLabel>
        <Input
          required
          type="number"
          value={form.yesThreshold}
          min={1}
          max={100}
          onBlur={() => {
            if (
              !form.yesThreshold ||
              form.yesThreshold.toString().match(/\D+/gim)
            ) {
              setForm({
                yesThreshold: DEFAULT_APPROVAL_QUORUM,
              })
            }
          }}
          onChange={($e) => {
            let yesThreshold = $e.target.value
            if (yesThreshold.length) {
              yesThreshold =
                +yesThreshold < 1 ? 1 : +yesThreshold > 100 ? 100 : yesThreshold
            }
            setForm({
              yesThreshold,
            })
          }}
        />
        <div className="pb-5" />
        <AmountSlider
          step={1}
          value={form.yesThreshold ?? DEFAULT_APPROVAL_QUORUM}
          disabled={false}
          onChange={($e) => {
            setForm({ yesThreshold: $e })
          }}
        />
        {/* <Input
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
        /> */}
      </div>
      <div className="pb-4">
        <TeamWalletField
          onInsert={handleInsertTeamWallet}
          onRemove={handleRemoveTeamWallet}
          wallets={form?.teamWallets ?? []}
        />
      </div>
    </div>
  )
}

export default MultisigOptions
