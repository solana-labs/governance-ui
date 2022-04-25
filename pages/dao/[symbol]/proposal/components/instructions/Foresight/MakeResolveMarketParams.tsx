/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { ForesightMakeResolveMarketParams } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { governance as foresightGov, utils } from '@foresight-tmp/foresight-sdk'
import {
  commonAssets,
  ForesightMarketIdInput,
  ForesightMarketListIdInput,
  ForesightWinnerInput,
} from './utils'
import { PublicKey } from '@solana/web3.js'

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
  async function ixCreator(
    form: ForesightMakeResolveMarketParams,
    programId: PublicKey
  ) {
    const ix = await foresightGov.genResolveMarketIx(
      form.winner,
      utils.intToArray(form.marketId, 1),
      Buffer.from(form.marketListId.padEnd(20)),
      programId,
      form.governedAccount.transferAddress!
    )
    return ix
  }
  effector(ixCreator)

  return (
    <>
      {governedAccountSelect}
      <ForesightMarketListIdInput {...inputProps} />
      <ForesightMarketIdInput {...inputProps} />
      <ForesightWinnerInput {...inputProps} />
    </>
  )
}

export default MakeResolveMarketParams
