/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { ForesightMakeAddMarketListToCategoryParams } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { governance as foresightGov } from '@foresight-tmp/foresight-sdk'
import {
  commonAssets,
  ForesightCategoryIdInput,
  ForesightMarketListIdInput,
} from './utils'
import { PublicKey } from '@solana/web3.js'

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
    wallet,
  } = commonAssets<ForesightMakeAddMarketListToCategoryParams>(
    { categoryId: '', marketListId: '' },
    index,
    governance
  )
  async function ixCreator(
    form: ForesightMakeAddMarketListToCategoryParams,
    programId: PublicKey
  ) {
    const { ix } = await foresightGov.genAddMarketListToCategoryIx(
      Buffer.from(form.categoryId.padEnd(20)),
      Buffer.from(form.marketListId.padEnd(20)),
      programId,
      wallet!.publicKey!
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
