import { Connection, Keypair, PublicKey } from '@solana/web3.js'

import { NextApiRequest, NextApiResponse } from 'next'
import { withSentry } from '@sentry/nextjs'
import { AnchorProvider, BN } from '@coral-xyz/anchor'
import EmptyWallet from '@utils/Mango/listingTools'
import { toUiDecimals } from '@blockworks-foundation/mango-v4'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!process.env.BACKEND_MAINNET_RPC)
    return res.status(500).json('BACKEND_MAINNET_RPC not provided in env')
  const conn = new Connection(process.env.BACKEND_MAINNET_RPC, 'recent')

  const options = AnchorProvider.defaultOptions()
  const adminProvider = new AnchorProvider(
    conn,
    new EmptyWallet(Keypair.generate()),
    options
  )
  const registrar = new PublicKey(
    '4WQSYg21RrJNYhF4251XFpoy1uYbMHcMfZNLMXA3x5Mp'
  )

  const vsr = await VsrClient.connect(
    adminProvider,
    new PublicKey('4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo')
  )
  const voters = await vsr.program.account['voter'].all()
  const resp: any[] = []

  for (const voter of voters) {
    if (voter.account.registrar.toString() != registrar.toString()) {
      continue
    }

    const deposited = new BN(0)
    // @ts-ignore
    for (const entry of voter.account.deposits) {
      if (entry.isUsed && entry.votingMintConfigIdx == 0) {
        deposited.iadd(entry.amountDepositedNative)
      }
    }
    if (deposited.gt(new BN(0))) {
      console.log({
        voter: voter.publicKey.toString(),
        wallet: voter.account.voterAuthority.toString(),
        deposited: toUiDecimals(deposited, 6),
      })
      resp.push({
        voter: voter.publicKey.toString(),
        wallet: voter.account.voterAuthority.toString(),
        deposited: toUiDecimals(deposited, 6),
      })
    }
  }

  res.status(200).json(resp)
}

export default withSentry(handler)
