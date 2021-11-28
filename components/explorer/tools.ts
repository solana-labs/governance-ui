import { PublicKey, Transaction } from '@solana/web3.js'
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
      cluster = 'devnet'
    }

    return cluster ? `?cluster=${cluster}` : ''
  }

  return `https://explorer.solana.com/${itemType}/${viewTypeOrItemAddress}${getClusterUrlParam()}`
}

/// Returns explorer inspector URL for the given transaction
export function getExplorerInspectorUrl(
  endpoint: string,
  transaction: Transaction
) {
  const SIGNATURE_LENGTH = 64

  const explorerUrl = new URL(getExplorerUrl(endpoint, 'inspector', 'tx'))

  const signatures = transaction.signatures.map((s) =>
    base58.encode(s.signature ?? Buffer.alloc(SIGNATURE_LENGTH))
  )
  explorerUrl.searchParams.append('signatures', JSON.stringify(signatures))

  const message = transaction.serializeMessage()
  explorerUrl.searchParams.append('message', message.toString('base64'))

  return explorerUrl.toString()
}
