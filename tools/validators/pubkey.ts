import { coerce, instance, string } from 'superstruct'
import {
  Connection,
  GetProgramAccountsFilter,
  PublicKey,
} from '@solana/web3.js'

import { getConnectionContext } from '@utils/connection'
import {
  MINT_PREFIX,
  NAME_TOKENIZER_ID,
  resolve,
} from '@bonfida/spl-name-service'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

export const PublicKeyFromString = coerce(
  instance(PublicKey),
  string(),
  (value) => new PublicKey(value)
)

export const tryParseKey = (key: string): PublicKey | null => {
  try {
    return new PublicKey(key)
  } catch (error) {
    return null
  }
}

export const tryParseDomain = async (
  domain: string
): Promise<PublicKey | null> => {
  const { current: connection } = getConnectionContext('mainnet')
  try {
    const publicKey = await resolve(connection, domain.toLowerCase().trim())

    return publicKey
  } catch (error) {
    console.log('🚀 ~ file: pubkey.ts:32 ~ error', error)
    return null
  }
}
