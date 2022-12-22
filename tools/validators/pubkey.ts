import { coerce, instance, string } from 'superstruct'
import { PublicKey } from '@solana/web3.js'
import { getDomainKey, NameRegistryState } from '@bonfida/spl-name-service'
import { getConnectionContext } from '@utils/connection'

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
    // pda
    const { pubkey: domainPDA } = await getDomainKey(
      domain.trim().toLowerCase()
    )

    const { nftOwner, registry } = await NameRegistryState.retrieve(
      connection,
      domainPDA
    )

    if (nftOwner) return nftOwner

    return registry.owner
  } catch (error) {
    return null
  }
}
