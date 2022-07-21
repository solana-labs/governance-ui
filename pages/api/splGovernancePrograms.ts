import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAllSplGovernanceProgramIds } from './tools/realms'

// Returns unique spl-governance program ids
const handler = (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(getAllSplGovernanceProgramIds())
}

export default withSentry(handler)
