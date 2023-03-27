import { useState } from 'react'

import {
  getAllDomains,
  performReverseLookupBatch,
} from '@bonfida/spl-name-service'
import { AssetAccount } from '@utils/uiTypes/assets'

export interface DomainObj {
  domainName: string | undefined
  domainAddress: string
}

const useDomainsForAccount = (connection) => {
  const [accountDomains, setAccountDomains] = useState<DomainObj[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshDomainsForAccount = async (account: AssetAccount) => {
    console.log(
      '🚀 ~ file: useDomainNames.tsx:19 ~ refreshDomainsForAccount ~ account:',
      account.pubkey.toBase58()
    )
    setIsLoading(true)
    try {
      const domains = await getAllDomains(connection, account.pubkey)
      const results: DomainObj[] = []

      if (domains.length > 0) {
        const reverse = await performReverseLookupBatch(connection, domains)

        for (let i = 0; i < domains.length; i++) {
          results.push({
            domainAddress: domains[i].toBase58(),
            domainName: reverse[i],
          })
        }
      }

      setAccountDomains(results)
    } catch (error) {
      setAccountDomains([])
    } finally {
      setIsLoading(false)
    }
  }

  return { accountDomains, isLoading, refreshDomainsForAccount }
}

export { useDomainsForAccount }
