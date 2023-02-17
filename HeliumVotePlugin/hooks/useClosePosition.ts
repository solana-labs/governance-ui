import useWallet from '@hooks/useWallet'
import { BN } from '@project-serum/anchor'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { sendTransaction } from '@utils/send'
import { PositionWithMeta } from '../sdk/types'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { useUnixNow } from '@hooks/useUnixNow'

export const useClosePosition = () => {
  const { unixNow } = useUnixNow()
  const { connection, wallet } = useWallet()
  const { realm, realmInfo } = useRealm()
  const [{ client }, registrarPk] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
    s.state.voteStakeRegistryRegistrarPk,
  ])
  const { error, loading, execute } = useAsyncCallback(
    async ({ position }: { position: PositionWithMeta }) => {
      const lockup = position.lockup
      const lockupKind = Object.keys(lockup.kind)[0]
      const isInvalid =
        !connection ||
        !connection.current ||
        !registrarPk ||
        !realm ||
        !client ||
        !(client instanceof HeliumVsrClient) ||
        !wallet ||
        !realmInfo ||
        !realmInfo.programVersion ||
        position.numActiveVotes > 0 ||
        // lockupExpired
        !(
          lockupKind !== 'constant' &&
          lockup.endTs.sub(new BN(unixNow!)).lt(new BN(0))
        )

      if (loading) return

      if (isInvalid) {
        throw new Error('Unable to Close Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []

        instructions.push(
          await client.program.methods
            .withdrawV0({
              amount: position.amountDepositedNative,
            })
            .accounts({
              position: position.pubkey,
              depositMint: realm.account.communityMint,
            })
            .instruction()
        )

        instructions.push(
          await client.program.methods
            .closePositionV0()
            .accounts({
              position: position.pubkey,
            })
            .instruction()
        )

        const tx = new Transaction()
        tx.add(...instructions)
        await sendTransaction({
          transaction: tx,
          wallet,
          connection: connection.current,
          signers: [],
          sendingMessage: `Closing`,
          successMessage: `Closed successfuly`,
        })
      }
    }
  )

  return {
    error,
    loading,
    closePosition: execute,
  }
}
