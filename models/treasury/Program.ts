import type { AssetAccount } from '@utils/uiTypes/assets'

export interface Program {
  address: string
  lastDeployedSlot: number
  upgradeAuthority?: string
  walletIsUpgradeAuthority: boolean
  raw: AssetAccount
}
