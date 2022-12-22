import { coerce, instance, string } from 'superstruct'
import { PublicKey } from '@solana/web3.js'
import {
  getDomainKey,
  NameRegistryState,
  // resolve,
} from '@bonfida/spl-name-service'
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
    const { pubkey: domainPDA } = await getDomainKey(
      domain.trim().toLowerCase()
    )

    const { nftOwner, registry } = await NameRegistryState.retrieve(
      connection,
      domainPDA
    )

    console.log(`Class: ${registry.class.toBase58()}`)
    console.log(`Data: ${registry.data?.toString()}`)
    console.log(`Owner: ${registry.owner?.toBase58()}`)
    console.log(`Parent: ${registry.parentName?.toBase58()}`)
    console.log(`NFT Owner: ${nftOwner?.toBase58()}`)

    // if domain is tokenized nftOwner should return the owner of it
    // Test domain
    // const domain = snakeoil.sol
    // expected nftOwner = 9apnHjEQ8enLaPLxP7z9VQTphWE4nWqZcyHJYocQMpSE

    if (nftOwner) return nftOwner

    return registry.owner
  } catch (error) {
    return null
  }
}
