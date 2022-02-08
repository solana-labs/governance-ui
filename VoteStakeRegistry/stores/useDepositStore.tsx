import create, { State } from 'zustand'
import { DepositWithMintAccount } from 'VoteStakeRegistry/sdk/accounts'
import { Connection, PublicKey } from '@solana/web3.js'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { BN } from '@blockworks-foundation/voter-stake-registry-client/node_modules/@project-serum/anchor'
import { getDeposits } from 'VoteStakeRegistry/tools/deposits'

interface DepositStore extends State {
  state: {
    deposits: DepositWithMintAccount[]
    votingPower: BN
    votingPowerFromDeposits: BN
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
    })
  },
}))

export default useDepositStore
