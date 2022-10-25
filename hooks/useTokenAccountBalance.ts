import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import { PublicKey, TokenAmount } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

export function useTokenAccountBalance(
  owner?: PublicKey | null,
  mint?: PublicKey
) {
  const connection = useWalletStore((s) => s.connection)

  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState<TokenAmount | null>(null)

  async function refetch() {
    try {
      if (!owner || !mint) {
        return setBalance(null)
      }
      const ata = await getAssociatedTokenAddress(mint, owner, true)
      const tokenBalance = await connection.current.getTokenAccountBalance(
        ata,
        'confirmed'
      )
      setBalance(tokenBalance.value)
      console.log('FETCHED BALANCE', tokenBalance.value)
    } catch (e) {
      console.error("Can't fetch token balance")
      setBalance(null)
    }
  }

  // https://stackoverflow.com/questions/61751728/asynchronous-calls-with-react-usememo
  useEffect(() => {
    let active = true
    fetchBalance()
    return () => {
      active = false
    }

    async function fetchBalance() {
      console.log('FETCHING BALANCE')
      try {
        setIsLoading(true)
        if (!owner || !mint) {
          return setBalance(null)
        }
        const ata = await getAssociatedTokenAddress(mint, owner, true)
        const tokenBalance = await connection.current.getTokenAccountBalance(
          ata,
          'confirmed'
        )
        if (!active) return
        setBalance(tokenBalance.value)
        console.log('FETCHED BALANCE', tokenBalance.value)
      } catch (e) {
        console.error("Can't fetch token balance")
        setBalance(null)
      } finally {
        setIsLoading(false)
      }
    }
  }, [owner, mint, connection.current.rpcEndpoint])

  return { balance, isLoading, refetch }
}
