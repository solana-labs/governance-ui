//temp solution for mango client

import { AnchorProvider } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import { WalletSigner } from '@solana/spl-governance'
import { MangoClient, MANGO_V4_ID } from '@blockworks-foundation/mango-v4'
import useWalletStore from 'stores/useWalletStore'

export default function UseMangoV4() {
  const cluster = useWalletStore((s) => s.connection).cluster
  const GROUP_NUM = 0
  const ADMIN_PK = new PublicKey('BJFYN2ZbcxRSTFGCAVkUEn4aJF99xaPFuyQj2rq5pFpo')
  const DEVNET_GROUP = new PublicKey(
    'Bpk8VzppSEkygd4KgXSgVzgVHib4EArhbDzyRpiS4yaf'
  )
  const MAINNET_GROUP = new PublicKey(
    '78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX'
  )
  const clientCluster = cluster === 'devnet' ? 'devnet' : 'mainnet-beta'
  const GROUP = cluster === 'devnet' ? DEVNET_GROUP : MAINNET_GROUP
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
      clientCluster,
      MANGO_V4_ID[clientCluster]
    )
    return client
  }
  return {
    ADMIN_PK,
    GROUP_NUM,
    GROUP,
    getClient,
  }
}
