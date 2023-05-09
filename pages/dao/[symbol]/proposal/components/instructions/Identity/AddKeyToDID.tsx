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
import { PublicKey } from '@solana/web3.js'
import {
  BitwiseVerificationMethodFlag,
  DidSolIdentifier,
  DidSolService,
  VerificationMethodType,
} from '@identity.com/sol-did-client'
import {
  governanceInstructionInput,
  governedAccountToWallet,
  instructionInputs,
  SchemaComponents,
} from '@utils/instructions/Identity/util'

interface AddKeyToDIDForm {
  governedAccount: AssetAccount | undefined
  did: string // manual entry for now - replace with dropdown once did-registry is introduced
  key: string // manual entry
  alias: string // manual entry
}

const AddKeyToDID = ({
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
  const [form, setForm] = useState<AddKeyToDIDForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })

    // getInstruction must return something, even if it is an invalid instruction
    let serializedInstructions = ['']

    if (
      isValid &&
      form!.governedAccount?.governance?.pubkey &&
      connection?.current
    ) {
      const service = DidSolService.build(DidSolIdentifier.parse(form!.did), {
        connection: connection.current,
        wallet: governedAccountToWallet(form!.governedAccount),
      })

      const addKeyIxs = await service
        .addVerificationMethod({
          flags: [BitwiseVerificationMethodFlag.CapabilityInvocation],
          fragment: form!.alias,
          keyData: new PublicKey(form!.key).toBytes(),
          // TODO support eth keys too
          methodType: VerificationMethodType.Ed25519VerificationKey2018,
        })
        // Adds a DID resize instruction if needed
        // The resize instruction performs a SOL transfer, so needs to be from
        // an account with no data, otherwise the Solana runtime will reject it.
        // this is why we use the governed account here as opposed to the governance
        // itself.
        .withAutomaticAlloc(form!.governedAccount.pubkey)
        .instructions()

      serializedInstructions = addKeyIxs.map(serializeInstructionToBase64)
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
      chunkSplitByDefault: true,
    }
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape(SchemaComponents)
  const inputs: InstructionInput[] = [
    governanceInstructionInput(
      realm,
      governance || undefined,
      assetAccounts,
      shouldBeGoverned
    ),
    instructionInputs.did,
    instructionInputs.key,
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

export default AddKeyToDID
