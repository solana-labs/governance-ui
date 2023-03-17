import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
  SYSTEM_PROGRAM_ID,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { NewProposalContext } from '../../../new'
import InstructionForm, { InstructionInputType } from '../FormCreator'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { getRegistrarPDA } from '@utils/plugin/accounts'

interface CreateNftRegistrarForm {
  governedAccount: AssetAccount | undefined
  maxCollections: number
}

const CreateNftPluginRegistrar = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm, realmInfo } = useRealm()
  const nftClient = useVotePluginsClientStore((s) => s.state.nftClient)
  const { assetAccounts } = useGovernanceAssets()
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = !!(index !== 0 && governance)
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
      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        nftClient!.program.programId
      )

      const createRegistrarIx = await nftClient!.program.methods
        .createRegistrar(form!.maxCollections)
        .accounts({
          registrar,
          realm: realm!.pubkey,
          governanceProgramId: realmInfo!.programId,
          realmAuthority: realm!.account.authority!,
          governingTokenMint: realm!.account.communityMint!,
          payer: wallet.publicKey!,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .instruction()
      serializedInstruction = serializeInstructionToBase64(createRegistrarIx)
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
  })
  const inputs = [
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
      label: 'Max collections',
      initialValue: 10,
      name: 'maxCollections',
      type: InstructionInputType.INPUT,
      inputType: 'number',
      min: 1,
      validateMinMax: true,
      hide: true,
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

export default CreateNftPluginRegistrar
