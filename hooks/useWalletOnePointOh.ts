import useWalletStore from '../stores/useWalletStore'
import useViewAsWallet from './useViewAsWallet'

/** Why does this have such a weird name?
 * I wanted to differentiate it from the solana-wallet-adapter hook, useWallet, which is used by Hubs
 * This is the one you should be using unless developing in Hubs (which you are probably not)
 * Feel free to direct questions to @asktree
 */
export default function useWalletOnePointOh() {
  const wallet = useWalletStore((s) => s.current)
  const debugWallet = useViewAsWallet()

  return debugWallet ?? wallet
}
