import { Connection, Keypair, PublicKey } from '@solana/web3.js'

import { NextApiRequest, NextApiResponse } from 'next'
import { withSentry } from '@sentry/nextjs'
import { AnchorProvider } from '@coral-xyz/anchor'
import EmptyWallet from '@utils/Mango/listingTools'
import { MANGO_V4_ID, MangoClient } from '@blockworks-foundation/mango-v4'
import { MAINNET_RPC } from '@constants/endpoints'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const mint = req.query.mint
  if (!mint) {
    return res.status(403).json('Please provide mint param')
  }
  const conn = new Connection(MAINNET_RPC, 'recent')
  const MAINNET_GROUP = new PublicKey(
    '78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX'
  )
  const clientCluster = conn.rpcEndpoint.includes('devnet')
    ? 'devnet'
    : 'mainnet-beta'

  const options = AnchorProvider.defaultOptions()
  const adminProvider = new AnchorProvider(
    conn,
    new EmptyWallet(Keypair.generate()),
    options
  )
  const client = await MangoClient.connect(
    adminProvider,
    clientCluster,
    MANGO_V4_ID[clientCluster]
  )
  const group = await client.getGroup(MAINNET_GROUP)

  const allMangoAccs = await client.getAllMangoAccounts(group)
  const bankForMint = group.banksMapByMint.get(mint as string)

  if (!bankForMint) {
    return res.status(403).json('No token with given mint found')
  }
  const usersWithNonZeroBalance = allMangoAccs
    .filter((x) => {
      return x.getTokenBalanceUi(bankForMint[0]) > 0
    })
    .map((x) => ({
      mangoAccount: x.publicKey.toBase58(),
      wallet: x.owner.toBase58(),
    }))

  res.status(200).json(usersWithNonZeroBalance)
}

export default withSentry(handler)
