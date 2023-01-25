import { useEffect, useState } from 'react'
import { Keypair, PublicKey } from '@solana/web3.js'
import useWallet from './useWallet'
import {
  keypairIdentity,
  Metaplex,
  Nft,
  NftWithToken,
  Sft,
  SftWithToken,
} from '@metaplex-foundation/js'

export const useNft = (mint: PublicKey | undefined) => {
  const { connection, connected } = useWallet()
  const [error, setError] = useState<Error | undefined>()
  const [loading, setLoading] = useState(false)
  const [nft, setNft] = useState<
    Sft | SftWithToken | Nft | NftWithToken | undefined
  >()

  useEffect(() => {
    ;(async () => {
      if (connection.current && connected && mint) {
        try {
          setLoading(true)
        } catch (e) {
          setError(e)
        } finally {
          setLoading(false)
        }
        const keypair = Keypair.generate()
        const metaplex = new Metaplex(connection.current)
        metaplex.use(keypairIdentity(keypair))
        const nft = await metaplex.nfts().findByMint({ mintAddress: mint })
        setNft(nft)
      }
    })()
  }, [connected, connection, mint, setLoading, setError, setNft])

  return { error, loading, nft }
}
