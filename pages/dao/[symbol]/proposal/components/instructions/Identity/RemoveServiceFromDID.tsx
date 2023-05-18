import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import { NewProposalContext } from '../../../new'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { DidSolIdentifier, DidSolService } from '@identity.com/sol-did-client'
import {
  governanceInstructionInput,
  governedAccountToWallet,
  instructionInputs,
  SchemaComponents,
} from '@utils/instructions/Identity/util'

interface RemoveServiceFromDIDForm {
  governedAccount: AssetAccount | undefined
  did: string // manual entry for now - replace with dropdown once did-registry is introduced
  alias: string // manual entry
}

const RemoveServiceFromDID = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<RemoveServiceFromDIDForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })

    // getInstruction must return something, even if it is an invalid instruction
    let serializedInstructions = ['']

    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      connection?.current
    ) {
      const service = DidSolService.build(DidSolIdentifier.parse(form!.did), {
        connection: connection.current,
        wallet: governedAccountToWallet(form!.governedAccount),
      })

      const removeServiceIxs = await service
        .removeService(form!.alias)
        .withAutomaticAlloc(form!.governedAccount.governance.pubkey)
        .instructions()

      serializedInstructions = removeServiceIxs.map(
        serializeInstructionToBase64
      )
    }

    // Realms appears to put additionalSerializedInstructions first, so reverse the order of the instructions
    // to ensure the resize function comes first.
    const [
      serializedInstruction,
      ...additionalSerializedInstructions
    ] = serializedInstructions.reverse()

    return {
      serializedInstruction,
      additionalSerializedInstructions,
      isValid,
      governance: form!.governedAccount?.governance,
    }
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    governedAccount: SchemaComponents.governedAccount,
    did: SchemaComponents.did,
    alias: SchemaComponents.alias,
  })
  const inputs: InstructionInput[] = [
    governanceInstructionInput(
      realm,
      governance || undefined,
      assetAccounts,
      shouldBeGoverned
    ),
    instructionInputs.did,
    instructionInputs.alias,
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

export default RemoveServiceFromDID
