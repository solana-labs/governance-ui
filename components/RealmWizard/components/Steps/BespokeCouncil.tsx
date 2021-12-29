/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { RealmWizardStepComponentProps } from '@components/RealmWizard/interfaces/Realm'
import Input from '@components/inputs/Input'
import Switch from '@components/Switch'
import { StyledLabel } from '@components/inputs/styles'
import TeamWalletField from '../TeamWalletField'
import useWalletStore from 'stores/useWalletStore'
const BespokeCouncil: React.FC<RealmWizardStepComponentProps> = ({
  setForm,
  form,
  formErrors,
}) => {
  const { current: wallet } = useWalletStore((s) => s)
  const [councilMintSwitch, setCouncilMintSwitch] = useState(false)
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

  const handleWallets = () => {
    if (councilMintSwitch && wallet?.publicKey) {
      // Forces to add the current wallet
      handleInsertTeamWallet([wallet.publicKey.toBase58()])
    } else {
      setForm({ teamWallets: [] })
    }
  }

  useEffect(() => {
    handleWallets()
  }, [councilMintSwitch])

  useEffect(() => {
    handleWallets()
  }, [])

  return (
    <>
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Council Settings</h1>
        </div>
      </div>
      <div className="pb-4 pr-10 mr-2">
        <div className="flex justify-left items-center">
          <Switch
            className="mt-2 mb-2"
            checked={councilMintSwitch}
            onChange={() => setCouncilMintSwitch(!councilMintSwitch)}
          />
          <StyledLabel className="mt-1.5 ml-3">Use Council</StyledLabel>
        </div>
      </div>
      {councilMintSwitch && (
        <div className="w-full">
          <Input
            label="Council Mint Id"
            placeholder="(Optional) Council mint"
            value={form?.councilMintId}
            type="text"
            error={formErrors['councilMintId'] || formErrors['councilMint']}
            onChange={(evt) => setForm({ councilMintId: evt.target.value })}
          />

          <TeamWalletField
            onInsert={handleInsertTeamWallet}
            onRemove={handleRemoveTeamWallet}
            wallets={form.teamWallets}
          />
        </div>
      )}
    </>
  )
}

export default BespokeCouncil
