import { gql, request } from 'graphql-request'

import { NFT } from '@models/treasury/NFT'
import { HOLAPLEX_GRAPQL_URL_MAINNET } from '@tools/constants'

const LIMIT = 500

const query = gql`
  query getNfts($owners: [PublicKey!], $limit: Int!, $offset: Int!) {
    nfts(owners: $owners, limit: $limit, offset: $offset) {
      address
      collection {
        address
        name
        image
        floorPrice
      }
      purchases {
        price
      }
      image
      name
      owner {
        address
      }
    }
  }
`

const _getNfts = (owners: string[], page: number) =>
  request(HOLAPLEX_GRAPQL_URL_MAINNET, query, {
    owners,
    limit: LIMIT,
    offset: page * LIMIT,
  })

export async function getNfts(owners: string[]) {
  let page = 0
  let keepFetching = true
  let nfts: NFT[] = []

  while (keepFetching) {
    const result = await _getNfts(owners, page)

    if ('error' in result || !result.nfts?.length) {
      keepFetching = false
    } else {
      nfts = nfts.concat(result.nfts)
      page += 1
    }
  }

  return nfts
}
