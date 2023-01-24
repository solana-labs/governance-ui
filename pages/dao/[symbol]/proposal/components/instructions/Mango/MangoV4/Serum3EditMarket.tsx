/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
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
import { Group } from '@blockworks-foundation/mango-v4'

type NameMarketIndexVal = {
  name: string
  value: MarketIndex
}

interface Serum3EditMarketForm {
  governedAccount: AssetAccount | null
  market: NameMarketIndexVal | null
  reduceOnly: boolean
}

const Serum3EditMarket = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { getClient, ADMIN_PK, GROUP } = UseMangoV4()
  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.SOL
  )
  const { connection } = useWalletStore()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<Serum3EditMarketForm>({
    governedAccount: null,
    reduceOnly: false,
    market: null,
  })
  const [mangoGroup, setMangoGroup] = useState<Group | null>(null)
  const [currentMarkets, setCurrentMarkets] = useState<NameMarketIndexVal[]>([])
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
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
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const client = await getClient(connection, wallet)
      const group = await client.getGroup(GROUP)
      const market = group.serum3MarketsMapByMarketIndex.get(
        Number(form.market?.value)
      )
      //TODO dao sol account as payer
      //Mango instruction call and serialize
      const ix = await client.program.methods
        .serum3EditMarket(form.reduceOnly)
        .accounts({
          group: group.publicKey,
          admin: ADMIN_PK,
          market: market!.publicKey,
        })
        .instruction()

      serializedInstruction = serializeInstructionToBase64(ix)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realmInfo?.programId])
  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])
  useEffect(() => {
    const getMarkets = async () => {
      const client = await getClient(connection, wallet!)
      const group = await client.getGroup(GROUP)
      const markets = [...group.serum3MarketsMapByExternal.values()].map(
        (x) => ({
          name: x.name,
          value: x.marketIndex,
        })
      )
      setCurrentMarkets(markets)
      setMangoGroup(group)
    }
    if (wallet?.publicKey) {
      getMarkets()
    }
  }, [connection.current && wallet?.publicKey?.toBase58()])
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
      options: governedProgramAccounts,
    },
    {
      label: 'Market',
      name: 'market',
      type: InstructionInputType.SELECT,
      initialValue: null,
      options: currentMarkets,
    },
    {
      label: 'Reduce Only',
      initialValue: form.reduceOnly,
      type: InstructionInputType.SWITCH,
      name: 'reduceOnly',
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

export default Serum3EditMarket
