import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { PositionWithMeta } from '../sdk/types'
import { PROGRAM_ID, init, daoKey } from '@helium/helium-sub-daos-sdk'
import useRealm from '@hooks/useRealm'
import { notify } from '@utils/notifications'
import {
  SequenceType,
  sendTransactionsV3,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'

export const useExtendPosition = () => {
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const { realm } = useRealm()
  const { error, loading, execute } = useAsyncCallback(
    async ({
      position,
      lockupPeriodsInDays,
      programId = PROGRAM_ID,
    }: {
      position: PositionWithMeta
      lockupPeriodsInDays: number
      programId?: PublicKey
    }) => {
      const isInvalid =
        !connection || !connection.current || !provider || !realm || !wallet

      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid || !hsdProgram) {
        throw new Error('Unable to Extend Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []
        const [dao] = daoKey(realm.account.communityMint)

        instructions.push(
          await hsdProgram.methods
            .resetLockupV0({
              kind: position.lockup.kind,
              periods: lockupPeriodsInDays,
            } as any)
            .accounts({
              position: position.pubkey,
              dao: dao,
            })
            .instruction()
        )

        notify({ message: 'Extending' })
        await sendTransactionsV3({
          transactionInstructions: [
            {
              instructionsSet: txBatchesToInstructionSetWithSigners(
                instructions,
                [],
                0
              ),
              sequenceType: SequenceType.Sequential,
            },
          ],
          wallet,
          connection: connection.current,
          callbacks: {
            afterAllTxConfirmed: () =>
              notify({
                message: 'Extension successful',
                type: 'success',
              }),
          },
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
