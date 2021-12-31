/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { RealmWizardStepComponentProps } from '@components/RealmWizard/interfaces/Realm'
import Input from '@components/inputs/Input'
import Switch from '@components/Switch'
import { StyledLabel } from '@components/inputs/styles'
import TeamWalletField from '../TeamWalletField'
import useWalletStore from 'stores/useWalletStore'
import ApprovalQuorumInput from '../ApprovalQuorumInput'
import { tryGetMint } from '@utils/tokens'
import { PublicKey } from '@solana/web3.js'
import _ from 'lodash'

const BespokeCouncil: React.FC<RealmWizardStepComponentProps> = ({
  setForm,
  form,
  formErrors,
  switchState = true,
  onSwitch = () => null,
}) => {
  const { current: wallet, connection } = useWalletStore((s) => s)
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
    if (switchState && wallet?.publicKey) {
      // Forces to add the current wallet
      handleInsertTeamWallet([wallet.publicKey.toBase58()])
    } else {
      setForm({ teamWallets: [] })
    }
  }

  const handleCouncilMint = async (mintId: string) => {
    try {
      const mintPublicKey = new PublicKey(mintId)
      const mint = await tryGetMint(connection.current, mintPublicKey)
      if (mint) {
        setForm({
          councilMint: mint,
        })
      }
    } catch (e) {
      console.log('failed to set council mint', e)
    }
  }

  useEffect(() => {
    _.debounce(async () => {
      if (form?.councilMintId) {
        await handleCouncilMint(form.councilMintId)
      }
    }, 250)()
    if (!form?.communityMintId?.length) {
      setForm({ communityMint: undefined })
    }
  }, [form?.councilMintId])

  useEffect(() => {
    handleWallets()
  }, [switchState])

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
            checked={switchState}
            onChange={(check) => {
              if (typeof onSwitch === 'function') onSwitch(check)
            }}
          />
          <StyledLabel className="mt-1.5 ml-3">Use Council</StyledLabel>
        </div>
      </div>
      {switchState && (
        <>
          <div className="pb-7 pr-10 w-full">
            <Input
              label="Council token mint"
              placeholder="(Optional) Council mint"
              value={form?.councilMintId}
              type="text"
              error={formErrors['councilMintId'] || formErrors['councilMint']}
              onChange={(evt) => setForm({ councilMintId: evt.target.value })}
            />
          </div>
          <div className="pb-7 pr-10 w-full" style={{ maxWidth: 512 }}>
            <ApprovalQuorumInput
              value={form.yesThreshold}
              onChange={($e) => {
                setForm({ yesThreshold: $e })
              }}
              onBlur={() => {
                if (
                  !form.yesThreshold ||
                  form.yesThreshold.toString().match(/\D+/gim)
                ) {
                  setForm({
                    yesThreshold: 60,
                  })
                }
              }}
            />
          </div>

          <TeamWalletField
            onInsert={handleInsertTeamWallet}
            onRemove={handleRemoveTeamWallet}
            wallets={form.teamWallets}
          />
        </>
      )}
    </>
  )
}

export default BespokeCouncil
