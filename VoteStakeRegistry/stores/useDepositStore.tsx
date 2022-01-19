import create, { State } from 'zustand'
import {
  DepositWithMintAccount,
  getRegistrarPDA,
  getVoterPDA,
  tryGetRegistrar,
  tryGetVoter,
  unusedMintPk,
} from 'VoteStakeRegistry/utils/voteRegistryTools'
import { Connection, PublicKey } from '@solana/web3.js'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { tryGetMint } from '@utils/tokens'

interface DepositStore extends State {
  state: {
    deposits: DepositWithMintAccount[]
  }
  resetDepositStore: () => void
  getDeposits: ({
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
}

const useDepositStore = create<DepositStore>((set, _get) => ({
  state: {
    ...defaultState,
  },
  getDeposits: async ({
    isUsed = true,
    realmPk,
    walletPk,
    communityMintPk,
    client,
    connection,
  }) => {
    const clientProgramId = client.program.programId
    const { registrar } = await getRegistrarPDA(
      realmPk,
      communityMintPk,
      clientProgramId
    )
    const { voter } = await getVoterPDA(registrar, walletPk, clientProgramId)
    const existingVoter = await tryGetVoter(voter, client)
    const existingRegistrar = await tryGetRegistrar(registrar, client)
    const mintCfgs = existingRegistrar?.votingMints
    const mints = {}
    let deposits: DepositWithMintAccount[] = []
    if (mintCfgs) {
      for (const i of mintCfgs) {
        if (i.mint.toBase58() !== unusedMintPk) {
          const mint = await tryGetMint(connection, i.mint)
          mints[i.mint.toBase58()] = mint
        }
      }
    }
    if (existingVoter) {
      deposits = existingVoter.deposits
        .map(
          (x, idx) =>
            ({
              ...x,
              mint: mints[mintCfgs![x.votingMintConfigIdx].mint.toBase58()],
              index: idx,
            } as DepositWithMintAccount)
        )
        .filter((x) => typeof isUsed === 'undefined' || x.isUsed === isUsed)
    }

    set((s) => {
      s.state.deposits = deposits
    })
  },
  resetDepositStore: () => {
    set((s) => {
      s.state = { ...defaultState }
    })
  },
}))

export default useDepositStore
