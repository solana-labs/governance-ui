import { PublicKey } from '@metaplex-foundation/js'
import { useQuery } from '@tanstack/react-query'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { useRouter } from 'next/router'

import DEVNET_REALMS from 'public/realms/devnet.json'
import MAINNET_REALMS from 'public/realms/mainnet-beta.json'

const useSelectedRealmPubkey = () => {
  const { symbol, cluster } = useRouter().query

  const parsed =
    typeof symbol === 'string' ? tryParsePublicKey(symbol) : undefined

  // if we cant just parse the realm pk from the url, look it up.
  // this happens a lot and might be slightly expensive so i decided to use react-query
  const { data: lookup } = useQuery({
    enabled: typeof symbol === 'string' && parsed === undefined,
    queryKey: ['Realms symbol lookup', symbol],
    queryFn: () => {
      if (typeof symbol !== 'string') throw new Error()

      // url symbol can either be pubkey or the DAO's "symbol", eg 'MNGO'
      const urlPubkey = tryParsePublicKey(symbol)
      if (urlPubkey) return urlPubkey

      const realms: { symbol: string }[] =
        cluster === 'devnet' ? DEVNET_REALMS : MAINNET_REALMS

      const realmPk = realms.find((x) => x.symbol === symbol)
      if (realmPk) return new PublicKey(realmPk)
      else throw new Error('DAO not found')
    },
  })

  // commenting out for SSR reasons
  //if (typeof symbol !== 'string') throw new Error('invalid url')
  return parsed ?? lookup
}

export default useSelectedRealmPubkey
