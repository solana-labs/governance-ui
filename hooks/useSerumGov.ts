import useWallet from './useWallet'
import useSWR from 'swr'
import { Connection, PublicKey } from '@solana/web3.js'
import useSerumGovUser from './useSerumGovUser'
import { AnchorProvider, Idl, Program } from '@coral-xyz/anchor'
import IDL from '../idls/serum_gov.json'
import useSerumGovStore, {
  ClaimTicketType,
  LockedAccountType,
  RedeemTicketType,
  VestAccountType,
} from 'stores/useSerumGovStore'
import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import useWalletStore from 'stores/useWalletStore'

export default function useSerumGov(ownerAddress?: PublicKey | string | null) {
  const connection = useWalletStore((s) => s.connection.current)
  const { anchorProvider } = useWallet()
  const serumGovProgramId = useSerumGovStore((s) => s.programId)
  const gsrmMint = useSerumGovStore((s) => s.gsrmMint)

  const { userAccount } = useSerumGovUser(ownerAddress)

  const { data: gsrmBalance, mutate: refreshGsrmBalance } = useSWR(
    () =>
      userAccount &&
      ownerAddress && [
        ownerAddress.toString(),
        gsrmMint.toBase58(),
        'gsrm_balance',
      ],
    () => fetchGsrmBalance(connection, gsrmMint, ownerAddress),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      errorRetryCount: 0,
    }
  )

  const {
    data: claimTickets,
    mutate: refreshClaimTickets,
    error: claimTicketsError,
    isValidating: claimTicketsIsValidating,
  } = useSWR(
    () =>
      userAccount &&
      ownerAddress && [
        ownerAddress.toString(),
        serumGovProgramId.toBase58(),
        'claim_tickets',
      ],
    () => fetchClaimTickets(anchorProvider, serumGovProgramId, ownerAddress),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      errorRetryCount: 0,
    }
  )
  const claimTicketsLoading = !claimTickets && !claimTicketsError

  const {
    data: redeemTickets,
    mutate: refreshRedeemTickets,
    error: redeemTicketsError,
    isValidating: redeemTicketsIsValidating,
  } = useSWR(
    () =>
      userAccount &&
      ownerAddress && [
        ownerAddress.toString(),
        serumGovProgramId.toBase58(),
        'redeem_tickets',
      ],
    () => fetchRedeemTickets(anchorProvider, serumGovProgramId, ownerAddress),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      errorRetryCount: 0,
    }
  )
  const redeemTicketsLoading = !redeemTickets && !redeemTicketsError

  const {
    data: lockedAccounts,
    mutate: refreshLockedAccounts,
    error: lockedAccountsError,
    isValidating: lockedAccountsIsValidating,
  } = useSWR(
    () =>
      userAccount &&
      ownerAddress && [
        ownerAddress.toString(),
        serumGovProgramId.toBase58(),
        'locked_accounts',
      ],
    () => fetchLockedAccounts(anchorProvider, serumGovProgramId, ownerAddress),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      errorRetryCount: 0,
    }
  )
  const lockedAccountsLoading = !lockedAccounts && !lockedAccountsError

  const {
    data: vestAccounts,
    mutate: refreshVestAccounts,
    error: vestAccountsError,
    isValidating: vestAccountsIsValidating,
  } = useSWR(
    () =>
      userAccount &&
      ownerAddress && [
        ownerAddress.toString(),
        serumGovProgramId.toBase58(),
        'vest_accounts',
      ],
    () => fetchVestAccounts(anchorProvider, serumGovProgramId, ownerAddress),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      errorRetryCount: 0,
    }
  )
  const vestAccountsLoading = !vestAccounts && !vestAccountsError

  return {
    gsrmBalance,
    refreshGsrmBalance,
    claimTickets,
    claimTicketsLoading,
    claimTicketsError,
    claimTicketsIsValidating,
    refreshClaimTickets,
    redeemTickets,
    redeemTicketsLoading,
    redeemTicketsError,
    redeemTicketsIsValidating,
    refreshRedeemTickets,
    lockedAccounts,
    lockedAccountsLoading,
    lockedAccountsError,
    lockedAccountsIsValidating,
    refreshLockedAccounts,
    vestAccounts,
    vestAccountsLoading,
    vestAccountsError,
    vestAccountsIsValidating,
    refreshVestAccounts,
  }
}

const fetchGsrmBalance = async (
  connection: Connection,
  gsrmMint: PublicKey,
  ownerAddress?: PublicKey | string | null
) => {
  if (!ownerAddress) throw new Error('No ownerAddress provided')

  const owner =
    typeof ownerAddress === 'string'
      ? new PublicKey(ownerAddress)
      : ownerAddress

  const ata = await getAssociatedTokenAddress(gsrmMint, owner, true)
  const tokenBalance = await connection.getTokenAccountBalance(ata, 'confirmed')
  return tokenBalance.value
}

const fetchClaimTickets = async (
  anchorProvider: AnchorProvider,
  serumGovProgramId: PublicKey,
  ownerAddress?: PublicKey | string | null
): Promise<ClaimTicketType[]> => {
  if (!ownerAddress) throw new Error('No ownerAddress provided')

  const owner =
    typeof ownerAddress === 'string'
      ? new PublicKey(ownerAddress)
      : ownerAddress

  const program = new Program(IDL as Idl, serumGovProgramId, anchorProvider)

  const tickets = await program.account.claimTicket.all([
    {
      memcmp: {
        offset: 8,
        bytes: owner.toBase58(),
      },
    },
  ])
  return tickets.map((t) => ({
    address: t.publicKey,
    owner: (t.account as any).owner,
    depositAccount: (t.account as any).depositAccount,
    gsrmAmount: (t.account as any).gsrmAmount,
    claimDelay: (t.account as any).claimDelay.toNumber(),
    createdAt: (t.account as any).createdAt.toNumber(),
  }))
}

const fetchRedeemTickets = async (
  anchorProvider: AnchorProvider,
  serumGovProgramId: PublicKey,
  ownerAddress?: PublicKey | string | null
): Promise<RedeemTicketType[]> => {
  if (!ownerAddress) throw new Error('No ownerAddress provided')

  const owner =
    typeof ownerAddress === 'string'
      ? new PublicKey(ownerAddress)
      : ownerAddress

  const program = new Program(IDL as Idl, serumGovProgramId, anchorProvider)

  const tickets = await program.account.redeemTicket.all([
    {
      memcmp: {
        offset: 8,
        bytes: owner.toBase58(),
      },
    },
  ])
  return tickets.map((t) => ({
    address: t.publicKey,
    owner: (t.account as any).owner,
    depositAccount: (t.account as any).depositAccount,
    redeemIndex: (t.account as any).redeemIndex.toNumber(),
    isMsrm: (t.account as any).isMsrm,
    amount: (t.account as any).amount,
    redeemDelay: (t.account as any).redeemDelay.toNumber(),
    createdAt: (t.account as any).createdAt.toNumber(),
  }))
}

const fetchLockedAccounts = async (
  anchorProvider: AnchorProvider,
  serumGovProgramId: PublicKey,
  ownerAddress?: PublicKey | string | null
): Promise<LockedAccountType[]> => {
  if (!ownerAddress) throw new Error('No ownerAddress provided')

  const owner =
    typeof ownerAddress === 'string'
      ? new PublicKey(ownerAddress)
      : ownerAddress

  const program = new Program(IDL as Idl, serumGovProgramId, anchorProvider)

  const accounts = await program.account.lockedAccount.all([
    {
      memcmp: {
        offset: 8,
        bytes: owner.toBase58(),
      },
    },
  ])
  return accounts.map((a) => ({
    address: a.publicKey,
    owner: (a.account as any).owner,
    lockIndex: (a.account as any).lockIndex.toNumber(),
    redeemIndex: (a.account as any).redeemIndex.toNumber(),
    createdAt: (a.account as any).createdAt.toNumber(),
    isMsrm: (a.account as any).isMsrm,
    totalGsrmAmount: (a.account as any).totalGsrmAmount,
    gsrmBurned: (a.account as any).gsrmBurned,
  }))
}

const fetchVestAccounts = async (
  anchorProvider: AnchorProvider,
  serumGovProgramId: PublicKey,
  ownerAddress?: PublicKey | string | null
): Promise<VestAccountType[]> => {
  if (!ownerAddress) throw new Error('No ownerAddress provided')

  const owner =
    typeof ownerAddress === 'string'
      ? new PublicKey(ownerAddress)
      : ownerAddress

  const program = new Program(IDL as Idl, serumGovProgramId, anchorProvider)

  const accounts = await program.account.vestAccount.all([
    {
      memcmp: {
        offset: 8,
        bytes: owner.toBase58(),
      },
    },
  ])
  return accounts.map((a) => ({
    address: a.publicKey,
    owner: (a.account as any).owner,
    isMsrm: (a.account as any).isMsrm,
    vestIndex: (a.account as any).vestIndex.toNumber(),
    redeemIndex: (a.account as any).redeemIndex.toNumber(),
    cliffPeriod: (a.account as any).cliffPeriod.toNumber(),
    linearVestingPeriod: (a.account as any).linearVestingPeriod.toNumber(),
    createdAt: (a.account as any).createdAt.toNumber(),
    totalGsrmAmount: (a.account as any).totalGsrmAmount,
    gsrmBurned: (a.account as any).gsrmBurned,
  }))
}

// export default function useSerumGov(ownerAddress?: PublicKey | string | null) {
//   const router = useRouter()
//   const routeHasClusterInPath = router.asPath.includes('cluster')
//   const { cluster } = router.query

//   const connection = useWalletStore((s) => s.connection.current)
//   const { anchorProvider } = useWallet()

//   const actions = useSerumGovStore((s) => s.actions)

//   const [gsrmBalance, setGsrmBalance] = useState<TokenAmount | null>(null)
//   const [userAccount, setUserAccount] = useState<UserAccountType | null>(null)
//   const [claimTickets, setClaimTickets] = useState<ClaimTicketType[]>([])
//   const [redeemTickets, setRedeemTickets] = useState<RedeemTicketType[]>([])
//   const [lockedAccounts, setLockedAccounts] = useState<LockedAccountType[]>([])
//   const [vestAccounts, setVestAccounts] = useState<VestAccountType[]>([])

//   async function refreshClaimTickets() {
//     const tickets = ownerAddress
//       ? await actions.getClaimTickets(
//           anchorProvider,
//           new PublicKey(ownerAddress)
//         )
//       : []
//     setClaimTickets(tickets)
//   }
//   async function refreshRedeemTickets() {
//     const tickets = ownerAddress
//       ? await actions.getRedeemTickets(
//           anchorProvider,
//           new PublicKey(ownerAddress)
//         )
//       : []
//     setRedeemTickets(tickets)
//   }
//   async function refreshLockedAccounts() {
//     const accounts = ownerAddress
//       ? await actions.getLockedAccounts(
//           anchorProvider,
//           new PublicKey(ownerAddress)
//         )
//       : []
//     setLockedAccounts(accounts)
//   }
//   async function refreshVestAccounts() {
//     const accounts = ownerAddress
//       ? await actions.getVestAccounts(
//           anchorProvider,
//           new PublicKey(ownerAddress)
//         )
//       : []
//     setVestAccounts(accounts)
//   }
//   async function refreshUserAccount() {
//     const account = ownerAddress
//       ? await actions.getUserAccount(
//           anchorProvider,
//           new PublicKey(ownerAddress)
//         )
//       : null
//     setUserAccount(account)
//   }
//   async function refreshGsrmBalance() {
//     const balance = ownerAddress
//       ? await actions.getGsrmBalance(connection, new PublicKey(ownerAddress))
//       : null
//     setGsrmBalance(balance)
//   }

// useEffect(() => {
//   async function getAllAccounts() {
//     await Promise.all([
//       refreshClaimTickets(),
//       refreshRedeemTickets(),
//       refreshLockedAccounts(),
//       refreshVestAccounts(),
//       refreshGsrmBalance(),
//       refreshUserAccount(),
//     ])
//   }

//   //Small hack to prevent race conditions with cluster change until we remove connection from store and move it to global dep.
//   if (
//     connection &&
//     ((routeHasClusterInPath && cluster) || !routeHasClusterInPath)
//   ) {
//     console.log('[serum_gov]: Loading Serum Gov data..')
//     getAllAccounts()
//   }
// }, [ownerAddress?.toString(), connection.rpcEndpoint])

//   return {
//     gsrmBalance,
//     userAccount,
//     claimTickets,
//     redeemTickets,
//     lockedAccounts,
//     vestAccounts,
//     refreshClaimTickets,
//     refreshRedeemTickets,
//     refreshLockedAccounts,
//     refreshVestAccounts,
//     refreshUserAccount,
//     refreshGsrmBalance,
//   }
// }
