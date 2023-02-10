import { BN } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import { tryGetMint } from '@utils/tokens'
import { WSOL_MINT } from '../tools'
import BufferLayout from 'buffer-layout'
import {
  LIDO_PROGRAM_ID,
  LIDO_PROGRAM_ID_DEVNET,
} from '@components/TreasuryAccount/ConvertToStSol'

const INSTRUCTIONS = {
  1: {
    name: 'Lido: Stake SOL for stSOL',
    accounts: [
      { name: 'Lido State' },
      { name: 'Source' },
      { name: 'Destination' },
      { name: 'stSOL Mint' },
    ],
    getDataUI: async (connection: Connection, data: Uint8Array) => {
      const tokenMint = await tryGetMint(connection, new PublicKey(WSOL_MINT))

      //@ts-ignore
      const { lamports } = BufferLayout.struct([
        BufferLayout.nu64('lamports'),
      ]).decode(Buffer.from(data), 1)

      const rawAmount = new BN(lamports)
      const tokenAmount = tokenMint
        ? getMintDecimalAmountFromNatural(tokenMint.account, rawAmount)
        : rawAmount

      const tokenAmountRes = tokenAmount.toNumber().toLocaleString()

      return (
        <>
          {tokenMint ? (
            <div>
              <div>
                <span>Amount:</span>
                <span>{` ${
                  tokenAmountRes === '0' ? '~' + tokenAmountRes : tokenAmountRes
                } ${'SOL'}`}</span>
              </div>
            </div>
          ) : (
            <div>{JSON.stringify(data)}</div>
          )}
        </>
      )
    },
  },
}

export const LIDO_INSTRUCTIONS = {
  [LIDO_PROGRAM_ID]: INSTRUCTIONS,
  [LIDO_PROGRAM_ID_DEVNET]: INSTRUCTIONS, // for devnet
}
