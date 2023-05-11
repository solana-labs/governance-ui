import { PROGRAM_VERSION_V1 } from '@solana/spl-governance'

import { PublicKey } from '@solana/web3.js'

import devnetRealms from 'public/realms/devnet.json'
import mainnetBetaRealms from 'public/realms/mainnet-beta.json'
import type { ConnectionContext } from 'utils/connection'
import { equalsIgnoreCase } from '../../tools/core/strings'

export interface RealmInfo {
  symbol: string
  voteSymbol?: string
  programId: PublicKey
  programVersion?: number
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

  // banner mage
  bannerImage?: string

  // Allow Realm to send email/SMS/Telegram/etc., notifications to governance members using Notifi
  enableNotifi?: boolean

  isCertified: boolean

  // 3- featured DAOs  ,2- new DAO with active proposals, 1- DAOs with active proposal,
  sortRank?: number

  // The default shared wallet of the DAO displayed on the home page
  // It's used for crowdfunding DAOs like  Ukraine.SOL or #Unchain_Ukraine
  sharedWalletId?: PublicKey

  communityMint?: PublicKey
}

export function getProgramVersionForRealm(realmInfo: RealmInfo) {
  // TODO: as a temp fix V1 is returned by default
  return realmInfo?.programVersion ?? PROGRAM_VERSION_V1
}

interface RealmInfoAsJSON
  extends Omit<
    RealmInfo,
    'programId' | 'realmId' | 'isCertified' | 'sharedWalletId' | 'communityMint'
  > {
  enableNotifi?: boolean
  programId: string
  realmId: string
  sharedWalletId?: string
  communityMint?: string
}

// TODO: Once governance program clones registry program and governance
//       accounts metadata is on-chain the list should be moved there
const MAINNET_REALMS = parseCertifiedRealms(mainnetBetaRealms)
const DEVNET_REALMS = parseCertifiedRealms(devnetRealms)

function parseCertifiedRealms(realms: RealmInfoAsJSON[]) {
  return realms.map((realm) => ({
    ...realm,
    programId: new PublicKey(realm.programId),
    realmId: new PublicKey(realm.realmId),
    sharedWalletId: realm.sharedWalletId && new PublicKey(realm.sharedWalletId),
    isCertified: true,
    programVersion: realm.programVersion,
    enableNotifi: realm.enableNotifi ?? true, // enable by default
    communityMint: realm.communityMint && new PublicKey(realm.communityMint),
  })) as ReadonlyArray<RealmInfo>
}

// Returns certified realms
// Note: the certification process is currently done through PRs to this repo
// This is a temp. workaround until we have the registry up and running
export function getCertifiedRealmInfos({ cluster }: ConnectionContext) {
  return cluster === 'devnet' ? DEVNET_REALMS : MAINNET_REALMS
}

export function getCertifiedRealmInfo(
  realmId: string,
  connection: ConnectionContext
) {
  if (!realmId) {
    return undefined
  }

  const realmInfo = getCertifiedRealmInfos(connection).find(
    (r) =>
      equalsIgnoreCase(r.realmId.toBase58(), realmId) ||
      equalsIgnoreCase(r.symbol, realmId)
  )

  return realmInfo
}

export function createUnchartedRealmInfo(realm: UnchartedRealm) {
  return {
    symbol: realm.name,
    programId: new PublicKey(realm.programId),
    realmId: new PublicKey(realm.address),
    displayName: realm.name,
    isCertified: false,
    enableNotifi: true, // enable by default
  } as RealmInfo
}

type UnchartedRealm = {
  name: string
  programId: string
  address: string
}
