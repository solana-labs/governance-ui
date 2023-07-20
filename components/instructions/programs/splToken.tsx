import { Connection, PublicKey } from '@solana/web3.js'
import { AccountMetaData, SYSTEM_PROGRAM_ID } from '@solana/spl-governance'
import { tryGetMint, tryGetTokenAccount } from '../../../utils/tokens'
import BN from 'bn.js'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'
import tokenPriceService from '@utils/services/tokenPrice'
import { TokenInstruction } from '@solendprotocol/solend-sdk/dist/instructions/instruction'
import { AuthorityType } from '@solana/spl-token'
import { struct, u8 } from 'buffer-layout'
import { publicKey } from '@coral-xyz/borsh'

interface TokenMintMetadata {
  name: string
}

// Mint metadata for Well known tokens displayed on the instruction card
const MINT_METADATA = {
  MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac: { name: 'MNGO' },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: { name: 'USDC' },
  '5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm': { name: 'SOCN' },
  SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt: { name: 'SRM' },
  MyHd6a7HWKTMeJMHBkrbMq4hZwZxwn9x7dxXcopQ4Wd: { name: 'OMH' },
  UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M: { name: 'UXP' },
  H7uqouPsJkeEiLpCEoC1qYVVquDrZan6ZfdPK2gS44zm: { name: 'FORE' },
}

export function getMintMetadata(
  tokenMintPk: PublicKey | undefined
): TokenMintMetadata {
  const tokenMintAddress = tokenMintPk ? tokenMintPk.toBase58() : ''
  const tokenInfo = tokenMintAddress
    ? tokenPriceService.getTokenInfo(tokenMintAddress)
    : null
  return tokenInfo
    ? { name: tokenInfo.symbol }
    : MINT_METADATA[tokenMintAddress]
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
        const tokenMint = tokenAccount
          ? await tryGetMint(connection, tokenAccount!.account.mint)
          : null

        const tokenMintDescriptor = getMintMetadata(tokenAccount?.account.mint)

        // TokenTransfer instruction layout
        // TODO: Use BufferLayout to decode the instruction
        // const dataLayout = BufferLayout.struct([
        //     BufferLayout.u8('instruction'),
        //     Layout.uint64('amount'),
        //   ]);
        const rawAmount = new BN(data.slice(1), 'le')
        const tokenAmount = tokenMint
          ? getMintDecimalAmountFromNatural(tokenMint.account, rawAmount)
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
    6: {
      name: 'Token: Set Mint Authority',
      accounts: [{ name: 'Mint', important: true }, { name: 'Mint Authority' }],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array
        //accounts: AccountMetaData[]
      ) => {
        interface SetAuthorityInstructionData {
          instruction: TokenInstruction.SetAuthority
          authorityType: AuthorityType
          newAuthorityOption: 1 | 0
          newAuthority: PublicKey
        }
        const authorityTypes = [
          'MintTokens',
          'FreezeAccount',
          'AccountOwner',
          'CloseAccount',
        ]
        const setAuthorityInstructionData = struct<SetAuthorityInstructionData>(
          [
            u8('instruction'),
            u8('authorityType'),
            u8('newAuthorityOption'),
            publicKey('newAuthority'),
          ]
        )
        let authorityParams: SetAuthorityInstructionData | null = null
        try {
          authorityParams = setAuthorityInstructionData.decode(
            Buffer.from(data)
          )
        } catch (e) {
          console.log(e)
        }

        return (
          <>
            {authorityParams ? (
              <div className="space-x-3">
                <div>
                  New authority:{' '}
                  {authorityParams.newAuthority.equals(SYSTEM_PROGRAM_ID)
                    ? 'None'
                    : authorityParams.newAuthority.toBase58()}
                </div>
                <div>
                  New authority option: {authorityParams.newAuthorityOption}
                </div>
                <div>
                  Authority type:{' '}
                  {authorityTypes[authorityParams.authorityType]}
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
        { name: 'Mint Authority' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const tokenMint = await tryGetMint(connection, accounts[0].pubkey)

        const tokenMintDescriptor = getMintMetadata(accounts[0].pubkey)

        // TokenMint instruction layout
        // TODO: Use BufferLayout to decode the instruction
        // const dataLayout = BufferLayout.struct([
        //     BufferLayout.u8('instruction'),
        //     Layout.uint64('amount'),
        //   ]);
        const rawAmount = new BN(data.slice(1), 'le')
        const tokenAmount = tokenMint
          ? getMintDecimalAmountFromNatural(tokenMint.account, rawAmount)
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
    8: {
      name: 'Token: Burn',
      accounts: [
        { name: 'Token Account', important: true },
        { name: 'Mint', important: true },
        { name: 'Account Owner' },
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const mint = accounts[1].pubkey
        const tokenMint = await tryGetMint(connection, mint)

        const tokenMintDescriptor = getMintMetadata(mint)

        const rawAmount = new BN(data.slice(1), 'le')
        const tokenAmount = tokenMint
          ? getMintDecimalAmountFromNatural(tokenMint.account, rawAmount)
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
    9: {
      name: 'Close Token Account',
      accounts: [
        { name: 'Token Account', important: true },
        { name: 'Rent destination' },
        { name: 'Account Owner' },
      ],
      getDataUI: async () => {
        return <></>
      },
    },
    17: {
      name: 'Sync Native',
      accounts: [],
      getDataUI: async () => {
        return <></>
      },
    },
  },
}
