import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllSplGovernanceProgramIds } from './tools/realms'

// Returns unique spl-governance program ids
const handler = (req: NextApiRequest, res: NextApiResponse) => {
  console.log('123123')
  const cluster = req.query.cluster?.toString() || undefined
  res.status(200).json(getAllSplGovernanceProgramIds(cluster))
}

export default withSentry(handler)
