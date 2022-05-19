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
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { NewProposalContext } from '../../../new'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'
import { PublicKey } from '@solana/web3.js'
import {
  getGatewayMaxVoterWeightRecord,
  getGatewayRegistrarPDA,
} from 'GatewayPlugin/sdk/accounts'
import { getValidatedPublickKey } from '@utils/validations'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'

interface ConfigureCollectionForm {
  governedAccount: AssetAccount | undefined
  weight: number
  size: number
  collection: string
}

const ConfigureGatewayPlugin = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm, mint } = useRealm()
  const gatewayClient = useVotePluginsClientStore((s) => s.state.gatewayClient)
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
      const weight = getMintNaturalAmountFromDecimalAsBN(
        form!.weight,
        mint!.decimals
      )
      const { registrar } = await getGatewayRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        gatewayClient!.program.programId
      )
      const { maxVoterWeightRecord } = await getGatewayMaxVoterWeightRecord(
        realm!.pubkey,
        realm!.account.communityMint,
        gatewayClient!.program.programId
      )
      const configureCollectionIx = await gatewayClient!.program.methods
        .configureCollection(weight, form!.size)
        .accounts({
          registrar,
          realm: realm!.pubkey,
          realmAuthority: realm!.account.authority!,
          collection: new PublicKey(form!.collection),
          maxVoterWeightRecord: maxVoterWeightRecord,
        })
        .instruction()
      serializedInstruction = serializeInstructionToBase64(
        configureCollectionIx
      )
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
      label: 'Gatekeeper Network',
      initialValue: '',
      inputType: 'text',
      name: 'gatekeeperNetwork',
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

export default ConfigureGatewayPlugin
