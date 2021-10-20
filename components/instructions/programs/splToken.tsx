import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '../../../models/accounts'
import { tryGetMint, tryGetTokenAccount } from '../../../utils/tokens'
import BN from 'bn.js'

export interface TokenDescriptor {
  name: string
  decimals: number
}

// Well known token account descriptors displayed on the instruction card
export const TOKEN_DESCRIPTORS = {
  Guiwem4qBivtkSFrxZAEfuthBz6YuWyCwS4G3fjBYu5Z: { name: 'MNGO' },
  '4PdEyhrV3gaUj4ffwjKGXBLo42jF2CQCCBoXenwCRWXf': { name: 'USDC' },
  '4nvTrY3KdYCVEtzfopCDZ2NuL8u6ZaHgL7xcUnQDQpHe': { name: 'SOCN' },
}

export function getTokenDescriptor(tokenAccountPk: PublicKey): TokenDescriptor {
  return TOKEN_DESCRIPTORS[tokenAccountPk.toBase58()]
}

export const SPL_TOKEN_INSTRUCTIONS = {
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: {
    3: {
      name: 'Token: Transfer',
      accounts: [
        { name: 'Source', important: true },
        { name: 'Destination', important: true },
        { name: 'Authority' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const tokenDescriptor = getTokenDescriptor(accounts[0].pubkey)
        const tokenAccount = await tryGetTokenAccount(
          connection,
          accounts[0].pubkey
        )
        const tokenMint = await tryGetMint(
          connection,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          tokenAccount!.account.mint
        )

        // TokenTransfer instruction layout
        // TODO: Use BufferLayout to decode the instruction
        // const dataLayout = BufferLayout.struct([
        //     BufferLayout.u8('instruction'),
        //     Layout.uint64('amount'),
        //   ]);
        const rawAmount = new BN(data.slice(1), 'le')
        const tokenAmount = tokenMint
          ? rawAmount.div(new BN(10).pow(new BN(tokenMint.account.decimals)))
          : rawAmount

        return (
          <>
            {tokenMint ? (
              <div>
                <div>
                  <span>Amount:</span>
                  <span>{`${tokenAmount.toNumber().toLocaleString()} ${
                    tokenDescriptor?.name ?? ''
                  }`}</span>
                </div>
              </div>
            ) : (
              <div>{JSON.stringify(data)}</div>
            )}
          </>
        )
      },
    },
    7: {
      name: 'Token: MintTo',
      accounts: [
        { name: 'Mint', important: true },
        { name: 'Destination', important: true },
        { name: 'Minting Authority' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const tokenDescriptor = getTokenDescriptor(accounts[0].pubkey)
        const tokenMint = await tryGetMint(connection, accounts[0].pubkey)

        // TokenMint instruction layout
        // TODO: Use BufferLayout to decode the instruction
        // const dataLayout = BufferLayout.struct([
        //     BufferLayout.u8('instruction'),
        //     Layout.uint64('amount'),
        //   ]);

        const rawAmount = new BN(data.slice(1), 'le')
        const tokenAmount = tokenMint
          ? rawAmount.div(new BN(10).pow(new BN(tokenMint.account.decimals)))
          : rawAmount

        return (
          <>
            {tokenMint ? (
              <div>
                <div>
                  <span>Amount:</span>
                  <span>{`${tokenAmount.toNumber().toLocaleString()} ${
                    tokenDescriptor?.name ?? ''
                  }`}</span>
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
