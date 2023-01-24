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
import { Registrar, Position, Lockup, LockupKind } from '../utils/types'

export const usePositions = ({
  registrarPk,
}: {
  registrarPk: PublicKey | undefined
}) => {
  const program = useHeliumVsr()
  const { connection, connected, wallet } = useWallet()
  const [state, setState] = useState<{
    positions: Position[]
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
      let positions: Position[] = []
      let votingPower = new BN(0)
      metaplex.use(keypairIdentity(keypair))
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
