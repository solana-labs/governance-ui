import { PublicKey, TokenAmount } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import useSerumGovStore, {
  ClaimTicketType,
  LockedAccountType,
  RedeemTicketType,
  UserAccountType,
  VestAccountType,
} from 'stores/useSerumGovStore'
import useWallet from './useWallet'
import useWalletStore from 'stores/useWalletStore'
import { useRouter } from 'next/router'

export default function useSerumGov(ownerAddress?: PublicKey | string | null) {
  const router = useRouter()
  const routeHasClusterInPath = router.asPath.includes('cluster')
  const { cluster } = router.query

  const connection = useWalletStore((s) => s.connection.current)
  const { anchorProvider } = useWallet()

  const actions = useSerumGovStore((s) => s.actions)

  const [gsrmBalance, setGsrmBalance] = useState<TokenAmount | null>(null)
  const [userAccount, setUserAccount] = useState<UserAccountType | null>(null)
  const [claimTickets, setClaimTickets] = useState<ClaimTicketType[]>([])
  const [redeemTickets, setRedeemTickets] = useState<RedeemTicketType[]>([])
  const [lockedAccounts, setLockedAccounts] = useState<LockedAccountType[]>([])
  const [vestAccounts, setVestAccounts] = useState<VestAccountType[]>([])

  async function refreshClaimTickets() {
    const tickets = ownerAddress
      ? await actions.getClaimTickets(
          anchorProvider,
          new PublicKey(ownerAddress)
        )
      : []
    setClaimTickets(tickets)
  }
  async function refreshRedeemTickets() {
    const tickets = ownerAddress
      ? await actions.getRedeemTickets(
          anchorProvider,
          new PublicKey(ownerAddress)
        )
      : []
    setRedeemTickets(tickets)
  }
  async function refreshLockedAccounts() {
    const accounts = ownerAddress
      ? await actions.getLockedAccounts(
          anchorProvider,
          new PublicKey(ownerAddress)
        )
      : []
    setLockedAccounts(accounts)
  }
  async function refreshVestAccounts() {
    const accounts = ownerAddress
      ? await actions.getVestAccounts(
          anchorProvider,
          new PublicKey(ownerAddress)
        )
      : []
    setVestAccounts(accounts)
  }
  async function refreshUserAccount() {
    const account = ownerAddress
      ? await actions.getUserAccount(
          anchorProvider,
          new PublicKey(ownerAddress)
        )
      : null
    setUserAccount(account)
  }
  async function refreshGsrmBalance() {
    const balance = ownerAddress
      ? await actions.getGsrmBalance(connection, new PublicKey(ownerAddress))
      : null
    setGsrmBalance(balance)
  }

  useEffect(() => {
    async function getAllAccounts() {
      refreshClaimTickets()
      refreshRedeemTickets()
      refreshLockedAccounts()
      refreshVestAccounts()
      refreshGsrmBalance()
      refreshUserAccount()
    }

    //Small hack to prevent race conditions with cluster change until we remove connection from store and move it to global dep.
    if (
      connection &&
      ((routeHasClusterInPath && cluster) || !routeHasClusterInPath)
    ) {
      console.log('Loading Serum Gov data..')
      getAllAccounts()
    }
  }, [ownerAddress, connection])

  return {
    gsrmBalance,
    userAccount,
    claimTickets,
    redeemTickets,
    lockedAccounts,
    vestAccounts,
    refreshClaimTickets,
    refreshRedeemTickets,
    refreshLockedAccounts,
    refreshVestAccounts,
    refreshUserAccount,
    refreshGsrmBalance,
  }
}
