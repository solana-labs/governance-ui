import { useEffect, useState } from 'react'

import {
  getAllDomains,
  performReverseLookupBatch,
} from '@bonfida/spl-name-service'

interface Domains {
  domainName: string | undefined
  domainAddress: string
}

const useDomainsForAccount = (connection, governedAccount) => {
  const [accountDomains, setAccountDomains] = useState<Domains[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(async () => {
      setIsLoading(true)
      const domains = await getAllDomains(connection, governedAccount.pubkey)

      if (domains.length > 0) {
        const reverse = await performReverseLookupBatch(connection, domains)
        const results: Domains[] = []

        for (let i = 0; i < domains.length; i++) {
          results.push({
            domainAddress: domains[i].toBase58(),
            domainName: reverse[i],
          })
        }

        setAccountDomains(results)
      }
      setIsLoading(false)
    })()
  }, [governedAccount, connection])

  return { accountDomains, isLoading }
}

export { useDomainsForAccount }
