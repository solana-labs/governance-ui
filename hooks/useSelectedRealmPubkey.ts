import { PublicKey } from '@metaplex-foundation/js'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { useRouter } from 'next/router'

import DEVNET_REALMS from 'public/realms/devnet.json'
import MAINNET_REALMS from 'public/realms/mainnet-beta.json'
import { useMemo } from 'react'

const useSelectedRealmPubkey = () => {
  const { symbol, cluster } = useRouter().query

  return useMemo(() => {
    if (symbol === undefined) return undefined
    if (typeof symbol !== 'string') throw new Error('invalid url')

    // url symbol can either be pubkey or the DAO's "symbol", eg 'MNGO'
    const urlPubkey = tryParsePublicKey(symbol)
    if (urlPubkey) return urlPubkey

    const DEVNET_SYMBOL_MAP = Object.fromEntries(
      DEVNET_REALMS.map((x) => [x.symbol, x.realmId])
    )

    // if this is too expensive it should be react-queryized (or some other declarative global memo)
    const MAINNET_SYMBOL_MAP = Object.fromEntries(
      MAINNET_REALMS.map((x) => [x.symbol, x.realmId])
    )

    const symbols =
      cluster === 'devnet' ? DEVNET_SYMBOL_MAP : MAINNET_SYMBOL_MAP
    const realmPk = symbols[symbol] as string | undefined
    if (realmPk) return new PublicKey(realmPk)
    else throw new Error('DAO not found')
  }, [cluster, symbol])
}

export default useSelectedRealmPubkey
