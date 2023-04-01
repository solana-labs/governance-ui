import useWalletStore from '../stores/useWalletStore'

export default function useWalletOnePointOh() {
  const wallet = useWalletStore((s) => s.current)
  return wallet
}
