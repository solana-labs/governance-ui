/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import * as yup from 'yup'
import { ForesightMakeAddMarketMetadataParams } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  governance as foresightGov,
  types as foresightTypes,
  consts as foresightConsts,
} from '@foresight-tmp/foresight-sdk'
import {
  commonAssets,
  ForesightContentInput,
  ForesightMarketIdInput,
  ForesightMarketListIdInput,
  ForesightMarketMetadataFieldSelect,
  getSchema,
} from './utils'

const MakeAddMarketMetadataParams = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const {
    inputProps,
    effector,
    governedAccountSelect,
  } = commonAssets<ForesightMakeAddMarketMetadataParams>(
    {
      marketListId: '',
      marketId: 0,
      content: '',
      field: Object.keys(
        foresightConsts.MARKET_METADATA_FIELDS
      )[0] as foresightConsts.MarketMetadataFieldName,
    },
    index,
    governance
  )
  const schema = getSchema({
    marketId: yup.number().required(),
    marketListId: yup.string().required(),
    content: yup.string().required(),
  })
  async function ixCreator(
    form: ForesightMakeAddMarketMetadataParams,
    program: foresightTypes.PredictionMarketProgram
  ) {
    const field = foresightConsts.MARKET_METADATA_FIELDS[form.field]
    const { ix } = await foresightGov.genWriteToFieldMarketMetadataIx(
      Uint8Array.from([form.marketId]),
      Buffer.from(form.marketListId.padEnd(20)),
      form.content,
      field,
      program,
      form.governedAccount.transferAddress!
    )
    return ix
  }
  effector(ixCreator, schema, index)
  return (
    <>
      {governedAccountSelect}
      <ForesightMarketIdInput {...inputProps} />
      <ForesightMarketListIdInput {...inputProps} />
      <ForesightContentInput {...inputProps} />
      <ForesightMarketMetadataFieldSelect {...inputProps} />
    </>
  )
}

export default MakeAddMarketMetadataParams
