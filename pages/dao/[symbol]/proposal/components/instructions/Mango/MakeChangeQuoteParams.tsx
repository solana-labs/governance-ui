/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoMakeChangeSpotMarketForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import {
  Config,
  makeChangeSpotMarketParamsInstruction,
  MangoClient,
  optionalBNFromString,
  QUOTE_INDEX,
} from '@blockworks-foundation/mango-client'
import { AccountType } from '@utils/uiTypes/assets'
import { I80F48OptionalFromNumber } from '@utils/tokens'

const MakeChangeQuoteParams = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)

  const { realmInfo } = useRealm()
  const { assetAccounts } = useGovernanceAssets()
  const governedProgramAccounts = assetAccounts.filter(
    (x) => x.type === AccountType.PROGRAM
  )
  const shouldBeGoverned = !!(index !== 0 && governance)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<MangoMakeChangeSpotMarketForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    mangoGroup: undefined,
    baseSymbol: undefined,
    maintLeverage: undefined,
    initLeverage: undefined,
    liquidationFee: undefined,
    optUtil: 0.7,
    optRate: 0.03,
    maxRate: 0.75,
    version: undefined,
  })
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
      const mangoGroupPk = new PublicKey(form.mangoGroup!)
      const groupConfig = Config.ids().groups.find((c) =>
        c.publicKey.equals(mangoGroupPk)
      )!

      const client = new MangoClient(connection, groupConfig.mangoProgramId)
      const mangoGroup = await client.getMangoGroup(groupConfig.publicKey)
      console.log(mangoGroup)
      const rootBanks = await mangoGroup.loadRootBanks(connection)
      const rootBank = rootBanks[QUOTE_INDEX]
      console.log(
        rootBank?.optimalRate.toNumber(),
        rootBank?.optimalUtil.toNumber(),
        rootBank?.maxRate.toNumber()
      )
      const instruction = makeChangeSpotMarketParamsInstruction(
        groupConfig.mangoProgramId,
        mangoGroup.publicKey,
        //Passed but actually not used random spot market
        groupConfig.spotMarkets[0].publicKey,
        rootBank!.publicKey,
        form.governedAccount.governance.pubkey,
        undefined,
        undefined,
        undefined,
        I80F48OptionalFromNumber(form.optUtil),
        I80F48OptionalFromNumber(form.optRate),
        I80F48OptionalFromNumber(form.maxRate),
        optionalBNFromString('0')
      )

      serializedInstruction = serializeInstructionToBase64(instruction)
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
  const schema = yup.object().shape({
    bufferAddress: yup.number(),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  return (
    <>
      {/* if you need more fields add theme to interface MangoMakeChangeMaxAccountsForm
        then you can add inputs in here */}
      <GovernedAccountSelect
        label="Program"
        governedAccounts={governedProgramAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        label="Mango group"
        value={form.mangoGroup}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mangoGroup',
          })
        }
        error={formErrors['mangoGroup']}
      />
      <Input
        label="Optimal utilization"
        value={form.optUtil}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'optUtil',
          })
        }
        error={formErrors['optUtil']}
      />

      <Input
        label="Optimal rate"
        value={form.optRate}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'optRate',
          })
        }
        error={formErrors['optRate']}
      />

      <Input
        label="Maximum rate"
        value={form.maxRate}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'maxRate',
          })
        }
        error={formErrors['maxRate']}
      />
    </>
  )
}

export default MakeChangeQuoteParams
