/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import * as yup from 'yup'
import { ForesightMakeResolveMarketParams } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  governance as foresightGov,
  types as foresightTypes,
} from '@foresight-tmp/foresight-sdk'
import {
  commonAssets,
  ForesightMarketIdInput,
  ForesightMarketListIdInput,
  ForesightWinnerInput,
  getSchema,
} from './utils'

const MakeResolveMarketParams = ({
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
  } = commonAssets<ForesightMakeResolveMarketParams>(
    { marketListId: '', marketId: 0, winner: 0 },
    index,
    governance
  )
  const schema = getSchema({
    marketId: yup.number().required(),
    marketListId: yup.string().required(),
    winner: yup.number().required(),
  })
  async function ixCreator(
    form: ForesightMakeResolveMarketParams,
    program: foresightTypes.PredictionMarketProgram
  ) {
    const ix = await foresightGov.genResolveMarketIx(
      form.winner,
      Uint8Array.from([form.marketId]),
      Buffer.from(form.marketListId.padEnd(20)),
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
      <ForesightWinnerInput {...inputProps} />
    </>
  )
}

export default MakeResolveMarketParams
