import { getCertifiedRealmInfos } from '@models/registry/api'
import { getConnectionContext } from '@utils/connection'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  res
    .status(200)
    .json([
      ...new Set(
        getCertifiedRealmInfos(getConnectionContext('mainnet')).map((info) =>
          info.programId.toBase58()
        )
      ),
    ])
}

export default handler
