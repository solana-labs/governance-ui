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
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { withCreateTokenOwnerRecord } from '@solana/spl-governance'

export const useExtendPosition = () => {
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const { realm, realmInfo } = useRealm()
  const [{ client }] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
  ])
  const { error, loading, execute } = useAsyncCallback(
    async ({
      position,
      lockupPeriodsInDays,
      tokenOwnerRecordPk,
      programId = PROGRAM_ID,
    }: {
      position: PositionWithMeta
      lockupPeriodsInDays: number
      tokenOwnerRecordPk: PublicKey | null
      programId?: PublicKey
    }) => {
      const isInvalid =
        !connection ||
        !connection.current ||
        !provider ||
        !realm ||
        !wallet ||
        !client ||
        !realmInfo ||
        !(client instanceof HeliumVsrClient)

      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid || !hsdProgram) {
        throw new Error('Unable to Extend Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []
        const [dao] = daoKey(realm.account.communityMint)
        const isDao = Boolean(await connection.current.getAccountInfo(dao))

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

        if (isDao) {
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
        } else {
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
        }

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
