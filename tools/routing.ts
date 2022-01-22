import { RealmInfo } from 'models/registry/api'

export function getRealmExplorerHost(realmInfo: RealmInfo | undefined) {
  switch (realmInfo?.symbol) {
    case 'MNGO':
      return 'dao.mango.markets'
    case 'UXD':
      return 'governance.uxd.fi'
    default:
      return 'realms-explorer.com'
  }
}
