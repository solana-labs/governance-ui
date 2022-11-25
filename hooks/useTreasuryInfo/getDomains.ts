import { Connection } from '@solana/web3.js'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  getAllDomains,
  performReverseLookupBatch,
} from '@bonfida/spl-name-service'
import { Domain } from '@models/treasury/Domain'

const getAccountDomains = async (
  account: AssetAccount,
  connection: Connection
): Promise<Domain[]> => {
  const domains = await getAllDomains(connection, account.pubkey)

  if (!domains.length) {
    return []
  }

  const reverse = await performReverseLookupBatch(connection, domains)

  return domains.map((domain, index) => ({
    name: reverse[index],
    address: domain.toBase58(),
    owner: account.pubkey.toBase58(),
  }))
}

export const getDomains = async (
  accounts: AssetAccount[],
  connection: Connection
): Promise<Domain[]> => {
  const accountsDomains = await Promise.all(
    accounts.map((account) => getAccountDomains(account, connection))
  )

  return accountsDomains.flat()
}
