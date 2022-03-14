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

import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useRealm from '@hooks/useRealm'
import { GovernedTokenAccount } from '@utils/tokens'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import {
  getNftMaxVoterWeightRecord,
  getNftRegistrarPDA,
} from 'VoteStakeRegistry/sdk/accounts'
import { NewProposalContext } from '../../../new'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'
import { PublicKey } from '@solana/web3.js'

interface CreateNftRegistrarForm {
  governedAccount: GovernedTokenAccount | undefined
  weight: number
  size: number
  collection: string
}

const CreateNftPluginRegistrar = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm } = useRealm()
  const nftClient = useVotePluginsClientStore((s) => s.state.nftClient)
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<CreateNftRegistrarForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const { registrar } = await getNftRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        nftClient!.program.programId
      )
      const { maxVoterWeightRecord } = await getNftMaxVoterWeightRecord(
        realm!.pubkey,
        realm!.account.communityMint,
        nftClient!.program.programId
      )
      const instruction = nftClient!.program.instruction.configureCollection(
        form!.weight,
        form!.size,
        {
          accounts: {
            registrar,
            realm: realm!.pubkey,
            realmAuthority: realm!.account.authority!,
            collection: new PublicKey(form!.collection),
            maxVoterWeightRecord: maxVoterWeightRecord,
          },
        }
      )
      serializedInstruction = serializeInstructionToBase64(instruction)
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
  })
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: null,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned,
      governance: governance,
      options: governedMultiTypeAccounts.filter(
        (x) =>
          x.governance.pubkey.toBase58() ===
          realm?.account.authority?.toBase58()
      ),
    },
    {
      label: 'Collection size',
      initialValue: 1,
      name: 'size',
      inputType: 'number',
      type: InstructionInputType.INPUT,
      min: 0,
      validateMinMax: true,
    },
    {
      label: 'Collection weight',
      initialValue: 0,
      name: 'weight',
      inputType: 'number',
      type: InstructionInputType.INPUT,
      min: 0,
      validateMinMax: true,
    },
    {
      label: 'Collection',
      initialValue: 0,
      inputType: 'text',
      name: 'collection',
      type: InstructionInputType.INPUT,
    },
  ]
  return (
    <>
      <InstructionForm
        setForm={setForm}
        inputs={inputs}
        setFormErrors={setFormErrors}
        formErrors={formErrors}
      ></InstructionForm>
    </>
  )
}

export default CreateNftPluginRegistrar
