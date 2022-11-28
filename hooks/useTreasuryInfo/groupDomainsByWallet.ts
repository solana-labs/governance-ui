import { Domain } from '@models/treasury/Domain'

export function groupDomainsByWallet(domains: Domain[]) {
  return domains.reduce((acc, domain) => {
    if (!acc[domain.owner]) {
      acc[domain.owner] = []
    }
    acc[domain.owner].push(domain)

    return acc
  }, {} as { [wallet: string]: Domain[] })
}
