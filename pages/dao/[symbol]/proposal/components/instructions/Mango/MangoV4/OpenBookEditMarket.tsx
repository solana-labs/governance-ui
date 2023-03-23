/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { AccountType, AssetAccount } from '@utils/uiTypes/assets'
import InstructionForm, {
  InstructionInput,
  InstructionInputType,
} from '../../FormCreator'
import UseMangoV4 from '../../../../../../../../hooks/useMangoV4'
import { MarketIndex } from '@blockworks-foundation/mango-v4/dist/types/src/accounts/serum3'

type NameMarketIndexVal = {
  name: string
  value: MarketIndex
}

interface OpenBookEditMarketForm {
  governedAccount: AssetAccount | null
  market: NameMarketIndexVal | null
  reduceOnly: boolean
  holdupTime: number
}

const OpenBookEditMarket = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { mangoClient, mangoGroup } = UseMangoV4()
  const { assetAccounts } = useGovernanceAssets()
  const solAccounts = assetAccounts.filter(
    (x) =>
      x.type === AccountType.SOL &&
      mangoGroup?.admin &&
      x.extensions.transferAddress?.equals(mangoGroup.admin)
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<OpenBookEditMarketForm>({
    governedAccount: null,
    reduceOnly: false,
    market: null,
    holdupTime: 0,
  })
  const [currentMarkets, setCurrentMarkets] = useState<NameMarketIndexVal[]>([])
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()
    let serializedInstruction = ''
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const market = mangoGroup!.serum3MarketsMapByMarketIndex.get(
        Number(form.market?.value)
      )

      const ix = await mangoClient!.program.methods
        .serum3EditMarket(form.reduceOnly)
        .accounts({
          group: mangoGroup!.publicKey,
          admin: form.governedAccount.extensions.transferAddress,
          market: market!.publicKey,
        })
        .instruction()

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
      customHoldUpTime: form.holdupTime,
    }
    return obj
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  useEffect(() => {
    const getMarkets = async () => {
      const markets = [...mangoGroup!.serum3MarketsMapByExternal.values()].map(
        (x) => ({
          name: x.name,
          value: x.marketIndex,
        })
      )
      setCurrentMarkets(markets)
    }
    if (mangoGroup) {
      getMarkets()
    }
  }, [mangoGroup?.publicKey.toBase58()])
  useEffect(() => {
    const getCurrentMarketProps = () => {
      const market = mangoGroup!.serum3MarketsMapByMarketIndex.get(
        Number(form.market?.value)
      )
      setForm({
        ...form,
        reduceOnly: market?.reduceOnly || false,
      })
    }
    if (form.market && mangoGroup) {
      getCurrentMarketProps()
    }
  }, [form.market?.value])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: solAccounts,
    },
    {
      label: 'Instruction hold up time (days)',
      initialValue: form.holdupTime,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'holdupTime',
    },
    {
      label: 'Market',
      name: 'market',
      type: InstructionInputType.SELECT,
      initialValue: form.market,
      options: currentMarkets,
    },
    {
      label: 'Reduce Only',
      initialValue: form.reduceOnly,
      type: InstructionInputType.SWITCH,
      name: 'reduceOnly',
    },
    {
      label: 'Instruction hold up time (days)',
      initialValue: form.holdupTime,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'holdupTime',
    },
  ]

  return (
    <>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
        ></InstructionForm>
      )}
    </>
  )
}

export default OpenBookEditMarket
