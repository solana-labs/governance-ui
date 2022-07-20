import { BN } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units';
import { tryGetMint } from '@utils/tokens';
import { WSOL_MINT } from '../tools';
import BufferLayout from 'buffer-layout';

export const MARINADE_INSTRUCTIONS = {
  MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD: {
    242: {
      name: 'Marinade: Stake SOL for mSOL',
      accounts: [
        { name: 'Marinade State' },
        { name: 'mSOL Mint' },
        { name: 'SOL Liquidity Pool' },
        { name: 'mSOL Liquidity Pool' },
        { name: 'mSOL Liquidity Pool Authority' },
        { name: 'Reserve' },
        { name: 'Source' },
        { name: 'Destination' },
        { name: 'mSOL Mint Authority' },
      ],
      getDataUI: async (connection: Connection, data: Uint8Array) => {
        const tokenMint = await tryGetMint(
          connection,
          new PublicKey(WSOL_MINT),
        );

        //@ts-ignore
        const { lamports } = BufferLayout.struct([
          BufferLayout.nu64('lamports'),
        ]).decode(Buffer.from(data), 8);

        const rawAmount = new BN(lamports);
        const tokenAmount = tokenMint
          ? getMintDecimalAmountFromNatural(tokenMint.account, rawAmount)
          : rawAmount;

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
        );
      },
    },
  },
};
