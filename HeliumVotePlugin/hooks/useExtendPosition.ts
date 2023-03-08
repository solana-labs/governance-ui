import useWallet from '@hooks/useWallet'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { sendTransaction } from '@utils/send'
import { PositionWithMeta } from '../sdk/types'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'

export const useExtendPosition = () => {
  const { connection, wallet } = useWallet()
  const [{ client }, registrarPk] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
    s.state.voteStakeRegistryRegistrarPk,
  ])
  const { error, loading, execute } = useAsyncCallback(
    async ({
      position,
      lockupPeriodsInDays,
    }: {
      position: PositionWithMeta
      lockupPeriodsInDays: number
    }) => {
      const isInvalid =
        !connection ||
        !connection.current ||
        !registrarPk ||
        !client ||
        !(client instanceof HeliumVsrClient) ||
        !wallet ||
        position.numActiveVotes > 0

      if (loading) return

      if (isInvalid) {
        throw new Error('Unable to Extend Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []

        instructions.push(
          await client.program.methods
            .resetLockupV0({
              kind: position.lockup.kind,
              periods: lockupPeriodsInDays,
            } as any)
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
          sendingMessage: `Extending`,
          successMessage: `Extension successful`,
        })
      }
    }
  )

  return {
    error,
    loading,
    extendPosition: execute,
  }
}
