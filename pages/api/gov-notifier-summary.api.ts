import { withSentry } from '@sentry/nextjs'
import { runNotifier } from '../../scripts/governance-notifier'

async function handler(req, res) {
  if (req?.headers?.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send('Unauthorized')
  }
  try {
    await runNotifier(true)
    res.status(200).send('Summary notifier executed successfully')
  } catch (error) {
    console.error(error)
    res.status(500).send('Error executing summary notifier')
  }
}

export default withSentry(handler)
