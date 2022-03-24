/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  ForesightMakeInitMarketParams,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance, GovernanceAccountType } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { GovernedMultiTypeAccount, tryGetMint } from '@utils/tokens'
import { Program } from '@project-serum/anchor'
import { FORESIGHT_MINT_DEVNET } from 'Strategies/protocols/foresight/tools'
import { governance as foresightGov, IDL } from '@foresight-tmp/foresight-sdk'
import { PredictionMarketProgram } from '@foresight-tmp/foresight-sdk/dist/types'

const MakeInitMarketParams = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { getGovernancesByAccountTypes } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const governedProgramAccounts = getGovernancesByAccountTypes([
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ]).map((x) => {
    return {
      governance: x,
    }
  })
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<ForesightMakeInitMarketParams>({
    governedAccount: undefined,
    marketListId: '',
    marketId: 0,
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
    if (isValid && programId && wallet?.publicKey) {
      //Mango instruction call and serialize
      const program: PredictionMarketProgram = new Program(
        IDL,
        'DHrfeiGybZDrU2HSX5eGahSXSa4u9ECZJPigNHeDuGT3'
      )
      const { ix: initMarketIx } = await foresightGov.genInitMarketIx(
        Buffer.from(form.marketListId.padEnd(20)),
        Uint8Array.from([form.marketId]),
        program
      )

      serializedInstruction = serializeInstructionToBase64(initMarketIx)
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
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
    marketId: yup.number().required(),
    marketListId: yup.string().required(),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Program"
        governedAccounts={governedProgramAccounts as GovernedMultiTypeAccount[]}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>
      <Input
        label="Market ID"
        value={form.marketId}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'marketId',
          })
        }
        error={formErrors['marketId']}
      />
      <Input
        label="Market List ID"
        value={form.marketListId}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'marketListId',
          })
        }
        error={formErrors['marketListID']}
      />
    </>
  )
}

export default MakeInitMarketParams
