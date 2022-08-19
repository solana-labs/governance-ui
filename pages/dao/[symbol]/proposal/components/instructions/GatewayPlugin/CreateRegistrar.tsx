import React, { useContext, useEffect, useMemo, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
  SYSTEM_PROGRAM_ID,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { NameValue, UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { NewProposalContext } from '../../../new'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../FormCreator'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { PublicKey } from '@solana/web3.js'
import { InformationCircleIcon } from '@heroicons/react/outline'
import Tooltip from '@components/Tooltip'
import { getRegistrarPDA } from '@utils/plugin/accounts'

interface CreateGatewayRegistrarForm {
  governedAccount: AssetAccount | undefined
  gatekeeperNetwork: NameValue // populated by dropdown
  otherGatekeeperNetwork: NameValue | undefined // manual entry
  predecessor: PublicKey | undefined // if part of a chain of plugins
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

  const chosenGatekeeperNetwork = useMemo(() => {
    const chosenEntry = form?.otherGatekeeperNetwork || form?.gatekeeperNetwork
    if (chosenEntry) {
      return new PublicKey(chosenEntry.value)
    }
  }, [form])

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
        gatewayClient!.program.programId
      )

      const remainingAccounts = form!.predecessor
        ? [{ pubkey: form!.predecessor, isSigner: false, isWritable: false }]
        : []

      const createRegistrarIx = await gatewayClient!.program.methods
        .createRegistrar(false)
        .accounts({
          registrar,
          realm: realm!.pubkey,
          governanceProgramId: realmInfo!.programId,
          realmAuthority: realm!.account.authority!,
          governingTokenMint: realm!.account.communityMint!,
          gatekeeperNetwork: chosenGatekeeperNetwork,
          payer: wallet.publicKey!,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .remainingAccounts(remainingAccounts)
        .instruction()
      serializedInstruction = serializeInstructionToBase64(createRegistrarIx)
    }
    return {
      serializedInstruction: serializedInstruction,
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
      options: assetAccounts.filter(
        (x) =>
          x.governance.pubkey.toBase58() ===
          realm?.account.authority?.toBase58()
      ),
    },
    {
      label: 'Civic Pass',
      initialValue: null,
      inputType: 'text',
      name: 'gatekeeperNetwork',
      type: InstructionInputType.SELECT,
      additionalComponent: (
        <Tooltip content="The type of Civic Pass to add to the DAO. Visit civic.com for details">
          <span>
            <InformationCircleIcon className="w-4 h-4 ml-1"></InformationCircleIcon>
            <p className="ml-1">
              By installing or integrating the{' '}
              <a href="https://www.civic.com">Civic Pass</a> plugin, you agree
              to the{' '}
              <a
                className="underline"
                href="https://www.civic.com/legal/terms-of-service-civic-pass-v1/"
              >
                Civic Pass Terms of Service
              </a>
            </p>
          </span>
        </Tooltip>
      ),
      options: [
        {
          name: 'Bot Resistance',
          value: 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6',
        },
        {
          name: 'Uniqueness',
          value: 'uniqobk8oGh4XBLMqM68K8M2zNu3CdYX7q5go7whQiv',
        },
        {
          name: 'ID Verification',
          value: 'bni1ewus6aMxTxBi5SAfzEmmXLf8KcVFRmTfproJuKw',
        },
        {
          name: 'ID Verification for DeFi',
          value: 'gatbGF9DvLAw3kWyn1EmH5Nh1Sqp8sTukF7yaQpSc71',
        },
        {
          name: 'Other',
          value: '',
        },
      ],
    },
    {
      label: 'Other Pass',
      initialValue: null,
      inputType: 'text',
      name: 'otherGatekeeperNetwork',
      type: InstructionInputType.INPUT,
      hide: () => form?.gatekeeperNetwork?.value.toString() !== '', // Other selected
    },
    {
      label: 'Predecessor plugin (optional)',
      initialValue: '',
      inputType: 'text',
      name: 'predecessor',
      type: InstructionInputType.INPUT,
      additionalComponent: (
        <Tooltip content="If the DAO is using more than one plugin, this is the program ID of the previous plugin in the chain.">
          <span>
            <InformationCircleIcon className="w-4 h-4 ml-1"></InformationCircleIcon>
          </span>
        </Tooltip>
      ),
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
