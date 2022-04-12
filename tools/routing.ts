import { RealmInfo } from 'models/registry/api';

export function getRealmExplorerHost(realmInfo: RealmInfo | undefined) {
  switch (realmInfo?.symbol) {
    case 'UXP':
      return 'governance.uxd.fi';
    default:
      return 'realms-explorer.com';
  }
}
