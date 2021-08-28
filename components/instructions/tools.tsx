import { PublicKey } from '@solana/web3.js'

export const PROGRAM_NAMES = {
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: 'Token Program',
}

export function getProgramName(programId: PublicKey) {
  return PROGRAM_NAMES[programId.toBase58()]
}

export const ACCOUNT_NAMES = {
  Guiwem4qBivtkSFrxZAEfuthBz6YuWyCwS4G3fjBYu5Z: 'MNGO Treasury',
  CF8sDcPztLDkvnEbYnCaXiDxhUpZ2uKLStpmFfRDNxSd: 'BTC-PERP MNGO',
  '9RGoboEjmaAjSCXsKi6p6zJucnwF3Eg5NUN9jPS6ziL3':
    'MNGO Treasury Governance Authority',
}

export function getAccountName(accountPk: PublicKey) {
  return ACCOUNT_NAMES[accountPk.toBase58()]
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

export const INSTRUCTION_DESCRIPTORS = {
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: {
    3: {
      name: 'Token: Transfer',
      accounts: [
        { name: 'Source', important: true },
        { name: 'Destination', important: true },
        { name: 'Authority' },
      ],
      getDataUI: (data: Uint8Array, _accounts: AccountDescriptor[]) => {
        return <>{JSON.stringify(data)}</>
      },
    },
  },
}

export function getInstructionDescriptor(
  programId: PublicKey,
  instructionId: number
): InstructionDescriptor | undefined {
  return INSTRUCTION_DESCRIPTORS[programId.toBase58()][instructionId]
}
