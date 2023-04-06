import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { sendTransaction } from '@utils/send'
import { PositionWithMeta } from '../sdk/types'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { secsToDays } from '@utils/dateTools'

export const useUnlockPosition = () => {
  const { connection, wallet } = useWalletDeprecated()
  const [{ client }] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
  ])
  const { error, loading, execute } = useAsyncCallback(
    async ({ position }: { position: PositionWithMeta }) => {
      const isInvalid =
        !connection ||
        !connection.current ||
        !client ||
        !(client instanceof HeliumVsrClient) ||
        !wallet ||
        position.numActiveVotes > 0

      if (loading) return

      if (isInvalid) {
        throw new Error('Unable to Unlock Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []

        instructions.push(
          await client.program.methods
            .resetLockupV0({
              kind: { cliff: {} },
              periods: secsToDays(
                position.lockup.endTs.sub(position.lockup.startTs).toNumber()
              ),
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
          sendingMessage: `Unlocking`,
          successMessage: `Unlocking successful`,
        })
      }
    }
  )

  return {
    error,
    loading,
    unlockPosition: execute,
  }
}
