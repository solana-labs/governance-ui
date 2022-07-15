/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { ForesightMakeSetMarketMetadataParams } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  governance as foresightGov,
  consts as foresightConsts,
  utils,
} from '@foresight-tmp/foresight-sdk'
import {
  commonAssets,
  ForesightContentInput,
  ForesightMarketIdInput,
  ForesightMarketListIdInput,
  ForesightMarketMetadataFieldSelect,
} from '@utils/Foresight'

export default function MakeSetMarketMetadataParams({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const { inputProps, effector, governedAccountSelect, wallet } =
    commonAssets<ForesightMakeSetMarketMetadataParams>(
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
  async function ixCreator(form: ForesightMakeSetMarketMetadataParams) {
    const field = foresightConsts.MARKET_METADATA_FIELDS[form.field]
    const { ix } = await foresightGov.genWriteToFieldMarketMetadataIx(
      utils.intToArray(form.marketId, 1),
      Buffer.from(form.marketListId.padEnd(20)),
      form.content,
      new field(),
      wallet!.publicKey!
    )
    return ix
  }
  effector(ixCreator)
  return (
    <>
      {governedAccountSelect}
      <ForesightMarketListIdInput {...inputProps} />
      <ForesightMarketIdInput {...inputProps} />
      <ForesightContentInput {...inputProps} />
      <ForesightMarketMetadataFieldSelect {...inputProps} />
    </>
  )
}
