import { PublicKey } from '@solana/web3.js'

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
)
export const SYSTEM = new PublicKey('11111111111111111111111111111111')
//////////////////////////////////////////
export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
    system: SYSTEM,
  }
}
