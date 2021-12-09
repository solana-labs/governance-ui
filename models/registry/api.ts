import { PublicKey } from '@solana/web3.js'
import devnetRealms from 'public/realms/devnet.json'
import mainnetBetaRealms from 'public/realms/mainnet-beta.json'
import { ConnectionContext } from 'stores/useWalletStore'
import { equalsIgnoreCase } from '../../tools/core/strings'

export enum ProgramVersion {
  V1 = 1,
  V2,
}

export interface RealmInfo {
  symbol: string
  programId: PublicKey
  programVersion?: ProgramVersion
  realmId: PublicKey
  website?: string
  // Specifies the realm mainnet name for resource lookups
  // It's required for none mainnet environments when the realm name is different than on mainnet
  displayName?: string
  // Website keywords
  keywords?: string
  // twitter:site meta
  twitter?: string
  // og:image
  ogImage?: string
}

interface RealmInfoAsJSON extends Omit<RealmInfo, 'programId' | 'realmId'> {
  programId: string
  realmId: string
}

// TODO: Once governance program clones registry program and governance
//       accounts metadata is on-chain the list should be moved there
const MAINNET_REALMS = parseRealms(mainnetBetaRealms)
const DEVNET_REALMS = parseRealms(devnetRealms)

function parseRealms(realms: RealmInfoAsJSON[]) {
  return realms.map(
    (realm) =>
      ({
        ...realm,
        programId: new PublicKey(realm.programId),
        realmId: new PublicKey(realm.realmId),
      } as RealmInfo)
  )
}

export function getAllRealmInfos({ cluster }: ConnectionContext) {
  return cluster === 'mainnet' ? MAINNET_REALMS : DEVNET_REALMS
}

export async function getRealmInfo(
  realmId: string,
  connection: ConnectionContext
) {
  if (!realmId) {
    return undefined
  }

  const realmInfo = getAllRealmInfos(connection).find(
    (r) =>
      equalsIgnoreCase(r.realmId.toBase58(), realmId) ||
      equalsIgnoreCase(r.symbol, realmId)
  )

  return realmInfo
}
