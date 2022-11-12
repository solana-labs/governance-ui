import { Connection } from '@solana/web3.js'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  getAllDomains,
  performReverseLookupBatch,
} from '@bonfida/spl-name-service'
import { Domain } from '@models/treasury/Domain'

export const getDomains = async (
  accounts: AssetAccount[],
  connection: Connection
) => {
  const domainsArr: Domain[] = []
  for (const account of accounts) {
    const domains = await getAllDomains(connection, account.pubkey)

    if (!domains.length) break

    const reverse = await performReverseLookupBatch(connection, domains)

    for (const [index, domain] of domains.entries()) {
      domainsArr.push({
        name: reverse[index],
        address: domain.toBase58(),
        owner: account.pubkey.toBase58(),
      })
    }
  }

  return domainsArr
}
