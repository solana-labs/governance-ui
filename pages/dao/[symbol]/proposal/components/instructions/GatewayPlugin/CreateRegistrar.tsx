import { useContext, useEffect, useMemo, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { NameValue, UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import { NewProposalContext } from '../../../new'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { InstructionInputType } from '../inputInstructionType'
import { AssetAccount } from '@utils/uiTypes/assets'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { PublicKey } from '@solana/web3.js'
import { InformationCircleIcon } from '@heroicons/react/outline'
import Tooltip from '@components/Tooltip'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import {availablePasses} from "../../../../../../../GatewayPlugin/config";
import {createCivicRegistrarIx} from "../../../../../../../GatewayPlugin/sdk/api";
import {useGatewayVoterWeightPlugin} from "../../../../../../../VoterWeightPlugins";

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
  const realm = useRealmQuery().data?.result
  const { gatewayClient } = useGatewayVoterWeightPlugin();
  const { assetAccounts } = useGovernanceAssets()
  const wallet = useWalletOnePointOh()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<CreateGatewayRegistrarForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const chosenGatekeeperNetwork = useMemo(() => {
    const chosenEntry =
      form?.otherGatekeeperNetwork || form?.gatekeeperNetwork?.value
    if (chosenEntry && chosenEntry !== '') {
      return new PublicKey(chosenEntry)
    }
  }, [form])

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      wallet?.publicKey && realm && gatewayClient
    ) {
      const createRegistrarIx = await createCivicRegistrarIx(
        realm,
          wallet.publicKey,
          gatewayClient,
          chosenGatekeeperNetwork!,
      )
      serializedInstruction = serializeInstructionToBase64(createRegistrarIx)
    }
    return {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form!.governedAccount?.governance,
    }
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
      options: availablePasses as any,
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
