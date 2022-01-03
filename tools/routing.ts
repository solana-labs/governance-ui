import { RealmInfo } from 'models/registry/api'

export function getRealmExplorerHost(realmInfo: RealmInfo | undefined) {
  return realmInfo?.symbol === 'MNGO'
    ? 'dao.mango.markets'
    : 'realms-explorer.com'
}
