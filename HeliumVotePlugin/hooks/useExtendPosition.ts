import useWallet from '@hooks/useWallet'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { sendTransaction } from '@utils/send'
import { PositionWithMeta } from '../sdk/types'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'

export const useExtendPosition = ({
  registrarPk,
}: {
  registrarPk: PublicKey | undefined
}) => {
  const { client } = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const { connection, wallet } = useWallet()
  const { realm, realmInfo } = useRealm()
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
        !realm ||
        !client ||
        !(client instanceof HeliumVsrClient) ||
        !wallet ||
        !realmInfo ||
        !realmInfo.programVersion ||
        position.numActiveVotes > 0

      if (loading) return

      if (isInvalid) {
        throw new Error('Unable to Unlock Position, Invalid params')
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
