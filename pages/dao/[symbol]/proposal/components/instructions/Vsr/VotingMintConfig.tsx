import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  //serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import useRealm from '@hooks/useRealm'
import { NewProposalContext } from '../../../new'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'
import { getValidatedPublickKey } from '@utils/validations'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'

interface ConfigureCollectionForm {
  governedAccount: AssetAccount | undefined
  mint: string
  mintIndex: number
  grantAuthority: AssetAccount | undefined
  mintDigitShift: number
  mintUnlockedFactor: number
  mintLockupFactor: number
  mintLockupSaturation: number
}

const VotingMintConfig = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm } = useRealm()
  //const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)
  const { assetAccounts } = useGovernanceAssets()
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<ConfigureCollectionForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form!.governedAccount?.governance.pubkey &&
      wallet?.publicKey
    ) {
      //   const configureCollectionIx = await vsrClient!.program.methods
      //     .configureVotingMint(        form!.mintIndex, // mint index
      //     form!.mintDigitShift, // digit_shift
      //     form!.mintUnlockedFactor, // unlocked_scaled_factor
      //     form!.mintLockupFactor, // lockup_scaled_factor
      //     form!.mintLockupSaturation, // lockup_saturation_secs
      //     form!.grantAuthority!.governance.pubkey!, // grant_authority)
      //     .accounts({
      //     })
      //     .instruction()
      serializedInstruction = ''
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form!.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    collection: yup
      .string()
      .test(
        'accountTests',
        'Collection address validation error',
        function (val: string) {
          if (val) {
            try {
              return !!getValidatedPublickKey(val)
            } catch (e) {
              console.log(e)
              return this.createError({
                message: `${e}`,
              })
            }
          } else {
            return this.createError({
              message: `Collection address is required`,
            })
          }
        }
      ),
  })
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: null,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned,
      governance: governance,
      options: assetAccounts.filter(
        (x) =>
          x.governance.pubkey.toBase58() ===
          realm?.account.authority?.toBase58()
      ),
    },
    {
      label: 'mint',
      initialValue: '',
      inputType: 'text',
      name: 'mint',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'mint index',
      initialValue: 0,
      inputType: 'number',
      name: 'mintIndex',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'Grant authority (Governance)',
      initialValue: null,
      name: 'grantAuthority',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      options: assetAccounts.filter((x) => x.isToken),
    },
    {
      label: 'mint digit shift',
      initialValue: 0,
      inputType: 'number',
      name: 'mintDigitShift',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'mint unlocked factor',
      initialValue: 0,
      inputType: 'number',
      name: 'mintUnlockedFactor',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'mint lockup factor',
      initialValue: 0,
      inputType: 'number',
      name: 'mintLockupFactor',
      type: InstructionInputType.INPUT,
    },
    {
      label: 'mint lockup saturation (years)',
      initialValue: 0,
      inputType: 'number',
      name: 'mintLockupSaturation',
      type: InstructionInputType.INPUT,
    },
  ]
  return (
    <>
      <InstructionForm
        outerForm={form}
        setForm={setForm}
        inputs={inputs}
        setFormErrors={setFormErrors}
        formErrors={formErrors}
      ></InstructionForm>
    </>
  )
}

export default VotingMintConfig
