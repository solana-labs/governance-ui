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
import { getValidatedPublickKey } from '@utils/validations'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  getMaxVoterWeightRecord,
  getRegistrarPDA,
} from '@utils/plugin/accounts'
import useWalletGay from '@hooks/useWallet'

interface ConfigureCollectionForm {
  governedAccount: AssetAccount | undefined
  weight: number
  size: number
  collection: string
}

const ConfigureNftPluginCollection = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm, mint } = useRealm()
  const nftClient = useVotePluginsClientStore((s) => s.state.nftClient)
  const { assetAccounts } = useGovernanceAssets()
  const wallet = useWalletGay()
  const shouldBeGoverned = !!(index !== 0 && governance)
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
      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        nftClient!.program.programId
      )
      const { maxVoterWeightRecord } = await getMaxVoterWeightRecord(
        realm!.pubkey,
        realm!.account.communityMint,
        nftClient!.program.programId
      )
      const configureCollectionIx = await nftClient!.program.methods
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
      chunkSplitByDefault: true,
    }
    return obj
  }
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form?.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
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
      label: 'Wallet',
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
      label: 'Collection size',
      initialValue: 0,
      name: 'size',
      inputType: 'number',
      type: InstructionInputType.INPUT,
      min: 1,
      validateMinMax: true,
    },
    {
      label: 'Collection weight',
      initialValue: 1,
      name: 'weight',
      inputType: 'number',
      type: InstructionInputType.INPUT,
      min: 0,
      validateMinMax: true,
    },
    {
      label: 'Collection',
      initialValue: '',
      inputType: 'text',
      name: 'collection',
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

export default ConfigureNftPluginCollection
