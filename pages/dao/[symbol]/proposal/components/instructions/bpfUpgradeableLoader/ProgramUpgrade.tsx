import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  ProgramUpgradeForm,
  programUpgradeFormNameOf,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance, GovernanceAccountType } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { createUpgradeInstruction } from '@tools/sdk/bpfUpgradeableLoader/createUpgradeInstruction'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import { debounce } from '@utils/debounce'
import { validateAccount, validateBuffer } from '@utils/validations'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { validateInstruction } from '@utils/instructionTools'
import ProgramUpgradeInfo from './ProgramUpgradeInfo'

const ProgramUpgrade = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { getGovernancesByAccountTypes } = useGovernanceAssets()
  const governedProgramAccounts = getGovernancesByAccountTypes([
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ]).map((x) => {
    return {
      governance: x,
    }
  })
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<ProgramUpgradeForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    bufferAddress: '',
    bufferSpillAddress: wallet?.publicKey?.toBase58(),
  })
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
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const bufferSpillAddress = form.bufferSpillAddress
        ? new PublicKey(form.bufferSpillAddress)
        : wallet.publicKey

      const upgradeIx = await createUpgradeInstruction(
        form.governedAccount.governance.account.governedAccount,
        new PublicKey(form.bufferAddress),
        form.governedAccount.governance.pubkey,
        bufferSpillAddress
      )
      serializedInstruction = serializeInstructionToBase64(upgradeIx)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetForm({
      propertyName: programUpgradeFormNameOf('programId'),
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetForm({
      propertyName: programUpgradeFormNameOf('bufferSpillAddress'),
      value: wallet?.publicKey?.toBase58(),
    })
  }, [wallet?.publicKey?.toBase58()])

  useEffect(() => {
    if (form.bufferAddress) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.bufferAddress])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    bufferAddress: yup
      .string()
      .test('bufferTest', 'Invalid buffer', async function (val: string) {
        if (val) {
          try {
            await validateBuffer(
              connection,
              val,
              form.governedAccount?.governance?.pubkey
            )
            return true
          } catch (e) {
            return this.createError({
              message: `${e}`,
            })
          }
        } else {
          return this.createError({
            message: `Buffer address is required`,
          })
        }
      }),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),

    bufferSpillAddress: yup
      .string()
      .test(
        'bufferSpillAddressTest',
        'Invalid buffer spill address',
        async function (val: string) {
          if (val) {
            try {
              await validateAccount(connection, val)
              return true
            } catch (ex) {
              return this.createError({
                message: `${ex}`,
              })
            }
            return true
          } else {
            return this.createError({
              message: `Buffer spill address is required`,
            })
          }
        }
      ),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Program"
        governedAccounts={governedProgramAccounts as GovernedMultiTypeAccount[]}
        onChange={(value) => {
          handleSetForm({
            value,
            propertyName: programUpgradeFormNameOf('governedAccount'),
          })
        }}
        value={form.governedAccount}
        error={formErrors[programUpgradeFormNameOf('governedAccount')]}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        label="Buffer address"
        value={form.bufferAddress}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: programUpgradeFormNameOf('bufferAddress'),
          })
        }
        error={formErrors[programUpgradeFormNameOf('bufferAddress')]}
      />

      <ProgramUpgradeInfo
        governancePk={form.governedAccount?.governance?.pubkey}
      ></ProgramUpgradeInfo>

      <Input
        label="Buffer spill address"
        value={form.bufferSpillAddress}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: programUpgradeFormNameOf('bufferSpillAddress'),
          })
        }
        error={formErrors[programUpgradeFormNameOf('bufferSpillAddress')]}
      />
    </>
  )
}

export default ProgramUpgrade
