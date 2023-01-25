import { useEffect, useState } from 'react'
import { keypairIdentity, Metaplex } from '@metaplex-foundation/js'
import { Keypair, PublicKey } from '@solana/web3.js'
import { useHeliumVsr } from './useHeliumVsr'
import useWallet from '@hooks/useWallet'
import { useAsyncCallback } from 'react-async-hook'
import { positionKey } from '@helium/voter-stake-registry-sdk'
import { chunks } from '../utils'
import { calcPositionVotingPower } from '../utils/calcPositionVotingPower'
import { BN } from '@project-serum/anchor'
import {
  Registrar,
  Lockup,
  LockupKind,
  Position,
  PositionWithVotingMint,
} from '../utils/types'
import { tryGetMint } from '@utils/tokens'

export const usePositions = ({
  registrarPk,
}: {
  registrarPk: PublicKey | undefined
}) => {
  const program = useHeliumVsr()
  const { connection, connected, wallet } = useWallet()
  const [state, setState] = useState<{
    positions: PositionWithVotingMint[]
    votingPower: BN
  }>({ positions: [], votingPower: new BN(0) })
  const { error, loading, execute } = useAsyncCallback(async () => {
    if (connected && connection && registrarPk && program) {
      if (loading) return
      const keypair = Keypair.generate()
      const metaplex = new Metaplex(connection.current)
      const registrar = (await program.account.registrar.fetch(
        registrarPk
      )) as Registrar
      const mintCfgs = registrar?.votingMints || []
      const mints = {}
      let positions: PositionWithVotingMint[] = []
      let votingPower = new BN(0)
      metaplex.use(keypairIdentity(keypair))
      for (const i of mintCfgs) {
        const mint = await tryGetMint(connection.current, i.mint)
        mints[i.mint.toBase58()] = mint
      }

      const posKeys = (
        await metaplex.nfts().findAllByOwner({
          owner: wallet!.publicKey!,
        })
      )
        .filter((nft) => nft.symbol === 'VSR')
        .map((nft) => positionKey((nft as any).mintAddress)[0])

      const result = await Promise.all(
        chunks(posKeys, 99).map((chunk) =>
          connection.current.getMultipleAccountsInfo(chunk)
        )
      )

      positions = result
        .flatMap((x) => x)
        .map(
          (pos) =>
            program.coder.accounts.decode('PositionV0', pos!.data) as Position
        )
        .map(
          (pos) =>
            ({
              ...pos,
              votingMint: {
                ...mintCfgs[pos.votingMintConfigIdx],
                mint: mints[mintCfgs[pos.votingMintConfigIdx].mint.toBase58()],
              },
            } as PositionWithVotingMint)
        )
        .filter((pos) => {
          const lockup = pos.lockup as Lockup
          const lockupKind = Object.keys(lockup.kind as LockupKind)[0]
          return ['constant', 'cliff'].includes(lockupKind)
        })

      votingPower = positions.reduce(
        (acc, pos) =>
          acc.add(
            calcPositionVotingPower({
              position: pos,
              registrar,
            })
          ),
        new BN(0)
      )

      setState((oldState) => ({
        ...oldState,
        positions,
        votingPower,
      }))
    }
  })

  useEffect(() => {
    ;(async () => {
      await execute()
    })()
  }, [connected, program, execute])

  return {
    error,
    loading,
    positions: state.positions,
    votingPower: state.votingPower,
    refetchPostions: execute,
  }
}
