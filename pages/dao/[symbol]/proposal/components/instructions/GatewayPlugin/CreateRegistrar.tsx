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
import { getGatewayRegistrarPDA } from 'GatewayPlugin/sdk/accounts'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { PublicKey } from '@solana/web3.js'

interface CreateGatewayRegistrarForm {
  governedAccount: AssetAccount | undefined
  gatekeeperNetwork: PublicKey
}

const CreateGatewayPluginRegistrar = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const { realm, realmInfo } = useRealm()
  const gatewayClient = useVotePluginsClientStore((s) => s.state.gatewayClient)
  const { assetAccounts } = useGovernanceAssets()
  const wallet = useWalletStore((s) => s.current)
  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<CreateGatewayRegistrarForm>()
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
      const { registrar } = await getGatewayRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        gatewayClient!.program.programId
      )

      const createRegistrarIx = await gatewayClient!.program.methods
        .createRegistrar()
        .accounts({
          registrar,
          realm: realm!.pubkey,
          governanceProgramId: realmInfo!.programId,
          realmAuthority: realm!.account.authority!,
          governingTokenMint: realm!.account.communityMint!,
          gatekeeperNetwork: form!.gatekeeperNetwork,
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
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
  })
  const inputs = [
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

export default CreateGatewayPluginRegistrar
