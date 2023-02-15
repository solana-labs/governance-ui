import { coerce, instance, string } from 'superstruct'
import { PublicKey } from '@solana/web3.js'

import { getConnectionContext } from '@utils/connection'
import { resolveDomain } from '@utils/domains'

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
    const publicKey = await resolveDomain(
      connection,
      domain.toLowerCase().trim()
    )

    return publicKey ?? null
  } catch (error) {
    return null
  }
}
