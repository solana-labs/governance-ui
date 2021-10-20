import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '../../../models/accounts'
import { tryGetMint, tryGetTokenAccount } from '../../../utils/tokens'
import BN from 'bn.js'

export interface TokenMintDescriptor {
  name: string
  decimals: number
}

// Well known token mint descriptors displayed on the instruction card
export const TOKEN_MINT_DESCRIPTORS = {
  MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac: { name: 'MNGO' },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: { name: 'USDC' },
  '5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm': { name: 'SOCN' },
  SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt: { name: 'SRM' },
}

export function getTokenMintDescriptor(
  tokenMintPk: PublicKey | undefined
): TokenMintDescriptor {
  // TODO: Fetch token mint metadata from the chain
  return tokenMintPk
    ? TOKEN_MINT_DESCRIPTORS[tokenMintPk.toBase58()]
    : undefined
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
        const tokenAccount = await tryGetTokenAccount(
          connection,
          accounts[0].pubkey
        )
        const tokenMint = await tryGetMint(
          connection,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          tokenAccount!.account.mint
        )

        const tokenMintDescriptor = getTokenMintDescriptor(
          tokenAccount?.account.mint
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
                    tokenMintDescriptor?.name ?? ''
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
        const tokenMint = await tryGetMint(connection, accounts[0].pubkey)

        const tokenMintDescriptor = getTokenMintDescriptor(accounts[0].pubkey)

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
                    tokenMintDescriptor?.name ?? ''
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
