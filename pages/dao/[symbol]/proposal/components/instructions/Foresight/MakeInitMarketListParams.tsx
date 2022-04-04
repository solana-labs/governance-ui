/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { ForesightHasMarketListId } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import {
  governance as foresightGov,
  types as foresightTypes,
} from '@foresight-tmp/foresight-sdk'
import { commonAssets, ForesightMarketListIdInput } from './utils'

const MakeInitMarketListParams = ({
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
  } = commonAssets<ForesightHasMarketListId>(
    { marketListId: '' },
    index,
    governance
  )
  async function ixCreator(
    form: ForesightHasMarketListId,
    program: foresightTypes.PredictionMarketProgram
  ) {
    const { ix } = await foresightGov.genInitMarketListIx(
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
      <ForesightMarketListIdInput {...inputProps} />
    </>
  )
}

export default MakeInitMarketListParams
