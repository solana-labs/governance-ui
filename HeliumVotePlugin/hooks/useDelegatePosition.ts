import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { PositionWithMeta, SubDaoWithMeta } from '../sdk/types'
import { PROGRAM_ID, init } from '@helium/helium-sub-daos-sdk'
import {
  SequenceType,
  sendTransactionsV3,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { notify } from '@utils/notifications'
import useRealm from '@hooks/useRealm'
import { withCreateTokenOwnerRecord } from '@solana/spl-governance'
import { useRealmQuery } from '@hooks/queries/realm'

export const useDelegatePosition = () => {
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const realm = useRealmQuery().data?.result
  const { realmInfo } = useRealm()
  const { error, loading, execute } = useAsyncCallback(
    async ({
      position,
      subDao,
      tokenOwnerRecordPk,
      programId = PROGRAM_ID,
    }: {
      position: PositionWithMeta
      subDao: SubDaoWithMeta
      tokenOwnerRecordPk: PublicKey | null
      programId?: PublicKey
    }) => {
      const isInvalid =
        !connection ||
        !connection.current ||
        !provider ||
        !wallet ||
        !realm ||
        !realmInfo ||
        position.isDelegated

      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid || !hsdProgram) {
        throw new Error('Unable to Delegate Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []

        if (!tokenOwnerRecordPk) {
          await withCreateTokenOwnerRecord(
            instructions,
            realm.owner,
            realmInfo.programVersion!,
            realm.pubkey,
            wallet!.publicKey!,
            realm.account.communityMint,
            wallet!.publicKey!
          )
        }

        instructions.push(
          await hsdProgram.methods
            .delegateV0()
            .accounts({
              position: position.pubkey,
              subDao: subDao.pubkey,
            })
            .instruction()
        )

        notify({ message: 'Delegating' })
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
                message: 'Delegation successful',
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
    delegatePosition: execute,
  }
}
