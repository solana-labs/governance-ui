import create, { State } from 'zustand'
import { DepositWithMintAccount } from 'VoteStakeRegistry/sdk/accounts'
import { Connection, PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { getDeposits } from 'VoteStakeRegistry/tools/deposits'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'

interface DepositStore extends State {
  state: {
    deposits: DepositWithMintAccount[]
    votingPower: BN
    votingPowerFromDeposits: BN
    isLoading: boolean
  }
  resetDepositState: () => void
  getOwnedDeposits: ({
    isUsed,
    realmPk,
    walletPk,
    communityMintPk,
    client,
    connection,
  }: {
    isUsed?: boolean | undefined
    realmPk: PublicKey
    walletPk: PublicKey
    communityMintPk: PublicKey
    client: VsrClient
    connection: Connection
  }) => Promise<void>
}

const defaultState = {
  deposits: [],
  votingPower: new BN(0),
  votingPowerFromDeposits: new BN(0),
  isLoading: false,
}

const useDepositStore = create<DepositStore>((set, _get) => ({
  state: {
    ...defaultState,
  },
  resetDepositState: () => {
    set((s) => {
      s.state = { ...defaultState }
    })
  },
  getOwnedDeposits: async ({
    isUsed = true,
    realmPk,
    walletPk,
    communityMintPk,
    client,
    connection,
  }) => {
    set((s) => {
      s.state.isLoading = true
    })

    const {
      votingPower,
      deposits,
      votingPowerFromDeposits,
    } = await getDeposits({
      isUsed,
      realmPk,
      walletPk,
      communityMintPk,
      client,
      connection,
    })

    set((s) => {
      s.state.votingPower = votingPower
      s.state.deposits = deposits
      s.state.votingPowerFromDeposits = votingPowerFromDeposits
      s.state.isLoading = false
    })
  },
}))

export default useDepositStore
