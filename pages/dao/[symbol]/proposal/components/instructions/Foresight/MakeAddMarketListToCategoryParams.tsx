/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { ForesightMakeAddMarketListToCategoryParams } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  governance as foresightGov,
  types as foresightTypes,
} from '@foresight-tmp/foresight-sdk'
import {
  commonAssets,
  ForesightCategoryIdInput,
  ForesightMarketListIdInput,
} from './utils'

function MakeAddMarketListToCategoryParams({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const {
    inputProps,
    effector,
    governedAccountSelect,
  } = commonAssets<ForesightMakeAddMarketListToCategoryParams>(
    { categoryId: '', marketListId: '' },
    index,
    governance
  )
  async function ixCreator(
    form: ForesightMakeAddMarketListToCategoryParams,
    program: foresightTypes.PredictionMarketProgram
  ) {
    const { ix } = await foresightGov.genAddMarketListToCategoryIx(
      Buffer.from(form.categoryId.padEnd(20)),
      Buffer.from(form.marketListId.padEnd(20)),
      program,
      form.governedAccount.transferAddress!
    )
    return ix
  }
  effector(ixCreator)

  return (
    <>
      {governedAccountSelect}
      <ForesightCategoryIdInput {...inputProps} />
      <ForesightMarketListIdInput {...inputProps} />
    </>
  )
}

export default MakeAddMarketListToCategoryParams
