import { coerce, instance, string } from 'superstruct'
import { PublicKey } from '@solana/web3.js'

import { getConnectionContext } from '@utils/connection'
import { resolve } from '@bonfida/spl-name-service'

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
    return null
  }
}
