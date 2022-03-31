/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  ForesightMakeAddMarketMetadataParams,
} from '@utils/uiTypes/proposalCreationTypes'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { NewProposalContext } from '../../../new'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import Input from '@components/inputs/Input'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import {
  governance as foresightGov,
  consts as foresightConsts,
} from '@foresight-tmp/foresight-sdk'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Select from '@components/inputs/Select'

const MakeAddMarketMetadataParams = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const filteredTokenAccounts = governedTokenAccountsWithoutNfts.filter((x) =>
    x.transferAddress?.equals(foresightGov.DEVNET_TREASURY)
  )
  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<ForesightMakeAddMarketMetadataParams>({
    governedAccount: filteredTokenAccounts[0],
    marketListId: '',
    marketId: 0,
    content: '',
    field: Object.keys(
      foresightConsts.MARKET_METADATA_FIELDS
    )[0] as foresightConsts.MarketMetadataFieldName,
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
      const program = foresightGov.readonlyProgram(
        new PublicKey(foresightConsts.DEVNET_PID)
      )
      const field = foresightConsts.MARKET_METADATA_FIELDS[form.field]
      const {
        ix: initMarketIx,
      } = await foresightGov.genWriteToFieldMarketMetadataIx(
        Uint8Array.from([form.marketId]),
        Buffer.from(form.marketListId.padEnd(20)),
        form.content,
        field,
        program,
        form.governedAccount.transferAddress!
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
    content: yup.string().required(),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Program"
        governedAccounts={
          governedTokenAccountsWithoutNfts as GovernedMultiTypeAccount[]
        }
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
        type="number"
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
        type="text"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'marketListId',
          })
        }
        error={formErrors['marketListID']}
      />
      <Input
        label="Content"
        value={form.content}
        type="text"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'content',
          })
        }
        error={formErrors['content']}
      />
      <Select
        label="Field"
        value={form.field}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'field' })
        }}
        error={formErrors['field']}
      >
        {Object.keys(foresightConsts.MARKET_METADATA_FIELDS).map((value) => (
          <Select.Option key={value} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>
    </>
  )
}

export default MakeAddMarketMetadataParams
