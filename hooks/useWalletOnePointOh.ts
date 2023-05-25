import { WalletContextState, useWallet } from '@solana/wallet-adapter-react'
import useViewAsWallet from './useViewAsWallet'
import { WalletSigner } from '@solana/spl-governance'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'

/** Why does this have such a weird name?
 * I wanted to differentiate it from the solana-wallet-adapter hook, useWallet, which is used by Hubs
 * This is the one you should be using unless developing in Hubs (which you are probably not)
 * Feel free to direct questions to @asktree
 */
export default function useWalletOnePointOh() {
  const { wallet } = useWallet()
  const debugAdapter = useViewAsWallet()

  const adapter =
    wallet !== null ? (wallet.adapter as SignerWalletAdapter) : undefined
  return debugAdapter ?? adapter
}
