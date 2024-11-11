import { AnchorProvider } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import { WalletSigner } from '@solana/spl-governance'
import Decimal from 'decimal.js'
import {
  Group,
  MangoClient,
  MANGO_V4_ID,
  Bank,
  MangoAccount,
} from '@blockworks-foundation/mango-v4'
import { useEffect, useState } from 'react'
import useWalletOnePointOh from './useWalletOnePointOh'
import useLegacyConnectionContext from './useLegacyConnectionContext'

export default function UseMangoV4(programId?: PublicKey, group?: PublicKey) {
  const connection = useLegacyConnectionContext()
  const cluster = connection.cluster
  const wallet = useWalletOnePointOh()
  const GROUP_NUM = 0
  const ADMIN_PK = new PublicKey('BJFYN2ZbcxRSTFGCAVkUEn4aJF99xaPFuyQj2rq5pFpo')
  const DEVNET_GROUP = new PublicKey(
    'Bpk8VzppSEkygd4KgXSgVzgVHib4EArhbDzyRpiS4yaf'
  )
  const MAINNET_GROUP = new PublicKey(
    '78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX'
  )
  const clientCluster = cluster === 'devnet' ? 'devnet' : 'mainnet-beta'
  const GROUP = group
    ? group
    : cluster === 'devnet'
    ? DEVNET_GROUP
    : MAINNET_GROUP

  const program = programId ? programId : MANGO_V4_ID[clientCluster]
  const isMainMangoProgram = program.equals(MANGO_V4_ID[clientCluster])
  const [mangoClient, setMangoClient] = useState<MangoClient | null>(null)
  const [mangoGroup, setMangoGroup] = useState<Group | null>(null)
  const getClient = async (
    connection: ConnectionContext,
    wallet: WalletSigner
  ) => {
    const options = AnchorProvider.defaultOptions()
    const adminProvider = new AnchorProvider(
      connection.current,
      wallet as any,
      options
    )

    const client = await MangoClient.connect(
      adminProvider,
      clientCluster,
      program,
      {
        idsSource: isMainMangoProgram ? 'api' : undefined,
      }
    )

    return client
  }

  useEffect(() => {
    const handleSetClient = async () => {
      const client = await getClient(connection, wallet!)
      const group = await client.getGroup(GROUP)
      setMangoClient(client)
      setMangoGroup(group)
    }
    if (wallet && connection) {
      console.log('SET NEW CLIENT')
      handleSetClient()
    }
  }, [
    connection.cluster,
    wallet?.publicKey?.toBase58(),
    GROUP.toBase58(),
    program.toBase58(),
  ])

  const docs = mangoClient?.program.idl.accounts
    .flatMap((x) => x.type.fields as any)
    .filter((x) => x)
    .filter((x) => (x as any).docs?.length)
    .map((x) => ({ ...x, docs: x.docs.join(' ') }))

  const getAdditionalLabelInfo = (name: string) => {
    const val = docs?.find((x) => x.name === name)

    if (val) {
      return `${val.docs}`
    } else {
      return ''
    }
  }

  const getMaxBorrowForBank = (
    group: Group,
    bank: Bank,
    mangoAccount: MangoAccount
  ) => {
    try {
      const maxBorrow = new Decimal(
        mangoAccount.getMaxWithdrawWithBorrowForTokenUi(group, bank.mint)
      )
      return maxBorrow
    } catch (e) {
      console.log(`failed to get max borrow for ${bank.name}`, e)
      return new Decimal(0)
    }
  }

  const getMaxWithdrawForBank = (
    group: Group,
    bank: Bank,
    mangoAccount: MangoAccount,
    allowBorrow = false
  ): Decimal => {
    const accountBalance = new Decimal(mangoAccount.getTokenBalanceUi(bank))
    const vaultBalance = group.getTokenVaultBalanceByMintUi(bank.mint)
    const maxBorrow = getMaxBorrowForBank(group, bank, mangoAccount)
    const maxWithdraw = allowBorrow
      ? Decimal.min(vaultBalance, maxBorrow)
      : bank.initAssetWeight.toNumber() === 0
      ? Decimal.min(accountBalance, vaultBalance)
      : Decimal.min(accountBalance, vaultBalance, maxBorrow)

    return Decimal.max(0, maxWithdraw)
  }

  return {
    ADMIN_PK,
    GROUP_NUM,
    GROUP,
    getClient,
    mangoClient,
    mangoGroup,
    getAdditionalLabelInfo,
    getMaxWithdrawForBank,
  }
}

export const MANGO_BOOST_PROGRAM_ID = new PublicKey(
  'zF2vSz6V9g1YHGmfrzsY497NJzbRr84QUrPry4bLQ25'
)
export const BOOST_MAINNET_GROUP = new PublicKey(
  'AKeMSYiJekyKfwCc3CUfVNDVAiqk9FfbQVMY3G7RUZUf'
)

export const MANGO_V4_MAINNET_GROUP = new PublicKey(
  '78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX'
)
