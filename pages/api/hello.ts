// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ name: 'John Doe' })
}

export default withSentry(handler)
