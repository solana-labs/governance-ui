//temp solution for mango client

import { AnchorProvider } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import { WalletSigner } from '@solana/spl-governance'
import { MangoClient, MANGO_V4_ID } from '@blockworks-foundation/mango-v4'

export default function UseMangoV4() {
  const DEVNET_SERUM3_MARKETS = new Map([
    ['BTC/USDC', 'DW83EpHFywBxCHmyARxwj3nzxJd7MUdSeznmrdzZKNZB'],
    ['SOL/USDC', '5xWpt56U1NCuHoAEtpLeUrQcxDkEpNfScjfLFaRzLPgR'],
  ])
  const DEVNET_MINTS = new Map([
    ['USDC', '8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN'], // use devnet usdc
    ['BTC', '3UNBZ6o52WTWwjac2kPUb4FyodhU1vFkRJheu1Sh2TvU'],
    ['SOL', 'So11111111111111111111111111111111111111112'],
    ['ORCA', 'orcarKHSqC5CDDsGbho8GKvwExejWHxTqGzXgcewB9L'],
    ['MNGO', 'Bb9bsTQa1bGEtQ5KagGkvSHyuLqDWumFUcRqFusFNJWC'],
  ])
  const DEVNET_ORACLES = new Map([
    ['BTC', 'HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J'],
    ['SOL', 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix'],
    ['ORCA', 'A1WttWF7X3Rg6ZRpB2YQUFHCRh1kiXV8sKKLV3S9neJV'],
    ['MNGO', '8k7F9Xb36oFJsjpCKpsXvg4cgBRoZtwNTc3EzG5Ttd2o'],
  ])
  const GROUP_NUM = 0
  const ADMIN_PK = new PublicKey('BJFYN2ZbcxRSTFGCAVkUEn4aJF99xaPFuyQj2rq5pFpo')
  const insuranceMint = new PublicKey(DEVNET_MINTS.get('USDC')!)
  const getClient = async (
    connection: ConnectionContext,
    wallet: WalletSigner
  ) => {
    const options = AnchorProvider.defaultOptions()
    const adminProvider = new AnchorProvider(
      connection.current,
      wallet as any,
      options
    )
    const client = await MangoClient.connect(
      adminProvider,
      'devnet',
      MANGO_V4_ID['devnet']
    )
    return client
  }
  return {
    DEVNET_SERUM3_MARKETS,
    DEVNET_MINTS,
    DEVNET_ORACLES,
    ADMIN_PK,
    insuranceMint,
    GROUP_NUM,
    getClient,
  }
}
