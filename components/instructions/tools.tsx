import { PublicKey } from '@solana/web3.js'
import { AccountMetaData } from '../../models/accounts'
import BN from 'bn.js'

// Well known program names displayed on the instruction card
export const PROGRAM_NAMES = {
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: 'Token Program',
}

export function getProgramName(programId: PublicKey) {
  return PROGRAM_NAMES[programId.toBase58()]
}

// Well known account names displayed on the instruction card
export const ACCOUNT_NAMES = {
  Guiwem4qBivtkSFrxZAEfuthBz6YuWyCwS4G3fjBYu5Z: 'MNGO Treasury',
  CF8sDcPztLDkvnEbYnCaXiDxhUpZ2uKLStpmFfRDNxSd: 'BTC-PERP MNGO',
  '9RGoboEjmaAjSCXsKi6p6zJucnwF3Eg5NUN9jPS6ziL3':
    'MNGO Treasury Governance Authority',
}

export function getAccountName(accountPk: PublicKey) {
  return ACCOUNT_NAMES[accountPk.toBase58()] ?? getProgramName(accountPk)
}

export interface TokenDescriptor {
  name: string
  decimals: number
}

// Well known token account descriptors displayed on the instruction card
export const TOKEN_DESCRIPTORS = {
  Guiwem4qBivtkSFrxZAEfuthBz6YuWyCwS4G3fjBYu5Z: { name: 'MNGO', decimals: 6 },
}

export function getTokenDescriptor(tokenAccountPk: PublicKey): TokenDescriptor {
  return TOKEN_DESCRIPTORS[tokenAccountPk.toBase58()]
}

export interface AccountDescriptor {
  name: string
  important?: boolean
}

export interface InstructionDescriptor {
  name: string
  accounts: AccountDescriptor[]
  getDataUI: (data: Uint8Array) => JSX.Element
}

// Well known program instructions displayed on the instruction card
export const INSTRUCTION_DESCRIPTORS = {
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: {
    3: {
      name: 'Token: Transfer',
      accounts: [
        { name: 'Source', important: true },
        { name: 'Destination', important: true },
        { name: 'Authority' },
      ],
      getDataUI: (data: Uint8Array, accounts: AccountMetaData[]) => {
        const tokenDescriptor = getTokenDescriptor(accounts[0].pubkey)

        // TokenTransfer instruction layout
        // TODO: Use BufferLayout to decode the instruction
        // const dataLayout = BufferLayout.struct([
        //     BufferLayout.u8('instruction'),
        //     Layout.uint64('amount'),
        //   ]);

        const tokenAmount = tokenDescriptor
          ? new BN(data.slice(1), 'le').div(
              new BN(10).pow(new BN(tokenDescriptor.decimals))
            )
          : new BN(0)

        return (
          <>
            {tokenDescriptor ? (
              <div>
                <div>
                  <span>Amount:</span>
                  <span>{`${tokenAmount.toNumber().toLocaleString()} ${
                    tokenDescriptor.name
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

export function getInstructionDescriptor(
  programId: PublicKey,
  instructionId: number
): InstructionDescriptor | undefined {
  const descriptor = INSTRUCTION_DESCRIPTORS[programId.toBase58()]
  return descriptor && descriptor[instructionId]
}
