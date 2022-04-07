import { RealmInfo } from 'models/registry/api';

export function getRealmExplorerHost(realmInfo: RealmInfo | undefined) {
  switch (realmInfo?.symbol) {
    case 'MNGO':
      return 'dao.mango.markets';
    default:
      return 'realms-explorer.com';
  }
}
