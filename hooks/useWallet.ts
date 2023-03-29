import useWalletStore from '../stores/useWalletStore'

export default function useWalletGay() {
  const wallet = useWalletStore((s) => s.current)
  return wallet
}
