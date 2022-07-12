import { BN } from '@project-serum/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import { tryGetMint } from '@utils/tokens'
import { WSOL_MINT } from '../tools'
import BufferLayout from 'buffer-layout'

export const LIDO_INSTRUCTIONS = {
  CbxVmURN74QZGuFj6qKjM8VDM8b8KKZrbPFLM2CC2hC8: {
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

        return (
          <>
            {tokenMint ? (
              <div>
                <div>
                  <span>Amount:</span>
                  <span>{`${tokenAmount
                    .toNumber()
                    .toLocaleString()} ${'SOL'}`}</span>
                </div>
              </div>
            ) : (
              <div>{JSON.stringify(data)}</div>
            )}
          </>
        )
      },
    },
  },
}
