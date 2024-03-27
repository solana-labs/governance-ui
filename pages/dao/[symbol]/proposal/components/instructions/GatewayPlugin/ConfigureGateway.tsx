import { useContext, useEffect, useMemo, useState } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'

import { NewProposalContext } from '../../../new'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { InstructionInputType } from '../inputInstructionType'
import { PublicKey } from '@solana/web3.js'
import { getValidatedPublickKey } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { AssetAccount } from '@utils/uiTypes/assets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import {configureCivicRegistrarIx} from "../../../../../../../GatewayPlugin/sdk/api";
import {useGatewayVoterWeightPlugin} from "../../../../../../../VoterWeightPlugins";

interface ConfigureGatewayForm {
  governedAccount: AssetAccount | undefined
  gatekeeperNetwork: PublicKey // populated by dropdown
  otherGatekeeperNetwork: PublicKey | undefined // manual entry
  predecessor: PublicKey | undefined // if part of a chain of plugins
}

const ConfigureGatewayPlugin = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const realm = useRealmQuery().data?.result
  const { assetAccounts } = useGovernanceAssets()
  const wallet = useWalletOnePointOh()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<ConfigureGatewayForm>()
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { gatewayClient } = useGatewayVoterWeightPlugin();

  const chosenGatekeeperNetwork = useMemo(() => {
    return form?.otherGatekeeperNetwork || form?.gatekeeperNetwork
  }, [form])

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      wallet?.publicKey &&
        realm && gatewayClient
    ) {
      const configureRegistrarTx = await configureCivicRegistrarIx(
          realm,
          gatewayClient,
          chosenGatekeeperNetwork!,
      )
      serializedInstruction = serializeInstructionToBase64(configureRegistrarTx)
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
    gatekeeperNetwork: yup
      .string()
      .test(
        'accountTests',
        'Gatekeeper network address validation error',
        function (val: string) {
          console.log('val', val)
          if (val) {
            try {
              return !!getValidatedPublickKey(val)
            } catch (e) {
              console.log("error with " + val, e)
              return this.createError({
                message: `${e}`,
              })
            }
          } else {
            return this.createError({
              message: `Gatekeeper network address is required`,
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
