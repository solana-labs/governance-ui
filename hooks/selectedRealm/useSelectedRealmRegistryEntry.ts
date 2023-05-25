import { useRealmQuery } from '@hooks/queries/realm'
import useProgramVersion from '@hooks/useProgramVersion'
import {
  createUnchartedRealmInfo,
  parseCertifiedRealms,
} from '@models/registry/api'
import { useQuery } from '@tanstack/react-query'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { useRouter } from 'next/router'

import DEVNET_REALMS from 'public/realms/devnet.json'
import MAINNET_REALMS from 'public/realms/mainnet-beta.json'
import { useMemo } from 'react'

const useSelectedRealmRegistryEntry = () => {
  const { symbol, cluster } = useRouter().query

  // if we cant just parse the realm pk from the url, look it up.
  // this happens a lot and might be slightly expensive so i decided to use react-query
  const { data: lookup } = useQuery({
    enabled: typeof symbol === 'string',
    queryKey: ['Realms entry lookup', symbol],
    queryFn: () => {
      if (typeof symbol !== 'string') throw new Error()

      // url symbol can either be pubkey or the DAO's "symbol", eg 'MNGO'
      const urlPubkey = tryParsePublicKey(symbol)
      const MAINNET_REALMS_PARSED = parseCertifiedRealms(MAINNET_REALMS)
      const DEVNET_REALMS_PARSED = parseCertifiedRealms(DEVNET_REALMS)
      const realms =
        cluster === 'devnet' ? DEVNET_REALMS_PARSED : MAINNET_REALMS_PARSED

      if (urlPubkey !== undefined) {
        realms.find((x) => x.realmId.equals(urlPubkey)) ?? 'not found'
      }

      return (
        realms.find((x) => x.symbol.toLowerCase() === symbol.toLowerCase()) ??
        'not found'
      )
    },
  })

  return lookup
}

export default useSelectedRealmRegistryEntry

/** Legacy hook structure, I suggest using useSelectedRealmRegistryEntry if you want the resgistry entry and useRealmQuery for on-chain data */
export const useSelectedRealmInfo = () => {
  const lookup = useSelectedRealmRegistryEntry()
  const realm = useRealmQuery().data?.result
  const programVersion = useProgramVersion()
  const queried = useMemo(
    () =>
      realm === undefined
        ? undefined
        : createUnchartedRealmInfo({
            programId: realm.owner.toBase58(),
            address: realm.pubkey.toBase58(),
            name: realm.account.name,
          }),
    [realm]
  )

  const result =
    lookup !== undefined && lookup !== 'not found' ? lookup : queried
  const resultVersion = programVersion ?? result?.programVersion
  const withVersion =
    resultVersion === undefined || result === undefined
      ? undefined
      : { ...result, programVersion: resultVersion }

  return withVersion
}
