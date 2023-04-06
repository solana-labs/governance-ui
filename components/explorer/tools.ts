import { PublicKey, Transaction } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import base58 from 'bs58'

export function getExplorerUrl(
  endpoint: string,
  viewTypeOrItemAddress: 'inspector' | PublicKey | string,
  itemType = 'address'
) {
  const getClusterUrlParam = () => {
    let cluster = ''
    if (endpoint === 'localnet') {
      cluster = `custom&customUrl=${encodeURIComponent(
        'http://127.0.0.1:8899'
      )}`
    } else if (endpoint === 'https://api.devnet.solana.com') {
      // if the default free RPC for devnet is used
      cluster = 'devnet'
    } else if (endpoint === 'devnet') {
      // connection.cluster is passed in
      cluster = 'devnet'
    }

    return cluster ? `?cluster=${cluster}` : ''
  }

  return `https://explorer.solana.com/${itemType}/${viewTypeOrItemAddress}${getClusterUrlParam()}`
}

/// Returns explorer inspector URL for the given transaction
export async function getExplorerInspectorUrl(
  connection: ConnectionContext,
  transaction: Transaction
) {
  const SIGNATURE_LENGTH = 64

  const explorerUrl = new URL(
    getExplorerUrl(connection.endpoint, 'inspector', 'tx')
  )

  const signatures = transaction.signatures.map((s) =>
    base58.encode(s.signature ?? Buffer.alloc(SIGNATURE_LENGTH))
  )
  explorerUrl.searchParams.append('signatures', JSON.stringify(signatures))
  const latestBlockhash = await connection.current.getLatestBlockhash()
  transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight
  transaction.recentBlockhash = latestBlockhash.blockhash

  const message = transaction.serializeMessage()
  explorerUrl.searchParams.append('message', message.toString('base64'))

  return explorerUrl.toString()
}
