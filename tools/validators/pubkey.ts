import { coerce, instance, string } from 'superstruct'
import { PublicKey } from '@solana/web3.js'

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
