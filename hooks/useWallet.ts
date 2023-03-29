import useWalletStore from '../stores/useWalletStore'

export default function useWallet() {
  const wallet = useWalletStore((s) => s.current)
  return wallet
}
