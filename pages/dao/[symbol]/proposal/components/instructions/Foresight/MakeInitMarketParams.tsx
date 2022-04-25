/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import { ForesightHasMarketId } from '@utils/uiTypes/proposalCreationTypes'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { governance as foresightGov, utils } from '@foresight-tmp/foresight-sdk'
import {
  commonAssets,
  ForesightMarketIdInput,
  ForesightMarketListIdInput,
} from './utils'
import { PublicKey } from '@solana/web3.js'

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
    wallet,
  } = commonAssets<ForesightHasMarketId>(
    { marketListId: '', marketId: 0 },
    index,
    governance
  )
  async function ixCreator(form: ForesightHasMarketId, programId: PublicKey) {
    const { ix } = await foresightGov.genInitMarketIx(
      Buffer.from(form.marketListId.padEnd(20)),
      utils.intToArray(form.marketId, 1),
      programId,
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
    </>
  )
}

export default MakeInitMarketParams
