import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { PositionWithMeta } from '../sdk/types'
import {
  PROGRAM_ID,
  init,
  delegatedPositionKey,
} from '@helium/helium-sub-daos-sdk'
import { notify } from '@utils/notifications'
import {
  SequenceType,
  sendTransactionsV3,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'

export const useUndelegatePosition = () => {
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const { error, loading, execute } = useAsyncCallback(
    async ({
      position,
      programId = PROGRAM_ID,
    }: {
      position: PositionWithMeta
      programId?: PublicKey
    }) => {
      const isInvalid =
        !connection ||
        !connection.current ||
        !provider ||
        !wallet ||
        !position.isDelegated

      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid || !hsdProgram) {
        throw new Error('Unable to Undelegate Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []
        const delegatedPosKey = delegatedPositionKey(position.pubkey)[0]
        const delegatedPosAcc = await hsdProgram.account.delegatedPositionV0.fetch(
          delegatedPosKey
        )

        instructions.push(
          await hsdProgram.methods
            .closeDelegationV0()
            .accounts({
              position: position.pubkey,
              subDao: delegatedPosAcc.subDao,
            })
            .instruction()
        )

        notify({ message: 'UnDelegating' })
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
                message: 'UnDelegation successful',
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
    undelegatePosition: execute,
  }
}
