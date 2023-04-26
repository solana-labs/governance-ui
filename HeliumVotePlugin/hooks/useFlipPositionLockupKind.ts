import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { PositionWithMeta } from '../sdk/types'
import { PROGRAM_ID, init, daoKey } from '@helium/helium-sub-daos-sdk'
import { secsToDays } from '@utils/dateTools'
import useRealm from '@hooks/useRealm'
import { notify } from '@utils/notifications'
import {
  SequenceType,
  sendTransactionsV3,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'

export const useFlipPositionLockupKind = () => {
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const { realm } = useRealm()
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
        !realm ||
        !wallet ||
        position.numActiveVotes > 0

      const lockupKind = Object.keys(position.lockup.kind)[0] as string
      const isConstant = lockupKind === 'constant'
      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid) {
        if (isConstant) {
          throw new Error('Unable to Unlock Position, Invalid params')
        } else {
          throw new Error('Unable to Pause Position, Invalid params')
        }
      } else {
        const instructions: TransactionInstruction[] = []
        const [dao] = daoKey(realm.account.communityMint)
        const kind = isConstant ? { cliff: {} } : { constant: {} }

        instructions.push(
          await hsdProgram.methods
            .resetLockupV0({
              kind,
              periods: secsToDays(
                position.lockup.endTs.sub(position.lockup.startTs).toNumber()
              ),
            } as any)
            .accounts({
              position: position.pubkey,
              dao: dao,
            })
            .instruction()
        )

        notify({ message: isConstant ? `Unlocking` : `Pausing` })
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
                message: isConstant
                  ? `Unlocking successful`
                  : `Pausing successful`,
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
    flipPositionLockupKind: execute,
  }
}
