import React, { useContext, useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { UiInstruction } from 'utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import {
  Governance,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { validateInstruction } from 'utils/instructionTools'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import Switch from '@components/Switch'
import Input from '@components/inputs/Input'
import { validatePubkey } from '@utils/formValidation'
import * as yup from 'yup'
import { PublicKey } from '@solana/web3.js'
import useWalletOnePointOh from '@hooks/useWallet'

type Form = {
  governedAccount: AssetAccount | null
  setAuthorityToNone: boolean
  mintAuthority: string
}

const SetMintAuthority = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { assetAccounts } = useGovernanceAssets()
  const mintGovernancesWithMintInfo = assetAccounts.filter(
    (x) => x.type === AccountType.MINT
  )
  const shouldBeGoverned = !!(index !== 0 && governance)

  const [form, setForm] = useState<Form>({
    governedAccount: null,
    setAuthorityToNone: false,
    mintAuthority: '',
  })
  const wallet = useWalletOnePointOh()
  const [formErrors, setFormErrors] = useState({})

  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form.governedAccount?.governance.account &&
      wallet?.publicKey
    ) {
      const ix = Token.createSetAuthorityInstruction(
        TOKEN_PROGRAM_ID,
        form.governedAccount.extensions.mint!.publicKey!,
        form.setAuthorityToNone ? null : new PublicKey(form.mintAuthority),
        'MintTokens',
        form.governedAccount.extensions.mint!.account.mintAuthority!,
        []
      )

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  const schema = yup.object().shape({
    mintAuthority: yup
      .string()
      .test(
        'mintAuthorityTest',
        'Invalid pubkey',
        async function (val: string) {
          console.log(val)
          if (val) {
            try {
              await validatePubkey(form.mintAuthority)
              return true
            } catch (e) {
              return this.createError({
                message: `${e}`,
              })
            }
          } else if (!form.setAuthorityToNone) {
            return this.createError({
              message: `Pubkey is required`,
            })
          }
          return true
        }
      ),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  useEffect(() => {
    handleSetForm({
      value: '',
      propertyName: 'mintAuthority',
    })
  }, [form.setAuthorityToNone])
  return (
    <>
      <GovernedAccountSelect
        label="Mint"
        governedAccounts={mintGovernancesWithMintInfo}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
        type="mint"
      ></GovernedAccountSelect>
      <div className="text-sm mb-3">
        <div className="mb-2">Set mint authority to none</div>
        <div className="flex flex-row text-xs items-center">
          <Switch
            checked={form.setAuthorityToNone}
            onChange={(checked) => {
              handleSetForm({
                value: checked,
                propertyName: 'setAuthorityToNone',
              })
            }}
          />
        </div>
      </div>
      {!form.setAuthorityToNone && (
        <Input
          label="Mint authority"
          value={form.mintAuthority}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'mintAuthority',
            })
          }
          error={formErrors['mintAuthority']}
        />
      )}
    </>
  )
}

export default SetMintAuthority
