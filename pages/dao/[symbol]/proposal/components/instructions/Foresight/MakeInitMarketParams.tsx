/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { ForesightHasMarketId } from '@utils/uiTypes/proposalCreationTypes'
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
} from './utils'

const MakeInitMarketParams = ({
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
  } = commonAssets<ForesightHasMarketId>(
    { marketListId: '', marketId: 0 },
    index,
    governance
  )
  async function ixCreator(
    form: ForesightHasMarketId,
    program: foresightTypes.PredictionMarketProgram
  ) {
    const { ix } = await foresightGov.genInitMarketIx(
      Buffer.from(form.marketListId.padEnd(20)),
      Uint8Array.from([form.marketId]),
      program,
      form.governedAccount.transferAddress!
    )
    return ix
  }
  effector(ixCreator)

  return (
    <>
      {governedAccountSelect}
      <ForesightMarketIdInput {...inputProps} />
      <ForesightMarketListIdInput {...inputProps} />
    </>
  )
}

export default MakeInitMarketParams
