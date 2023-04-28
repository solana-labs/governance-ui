import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { BN, Program } from '@coral-xyz/anchor'
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
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { useSolanaUnixNow } from '@hooks/useSolanaUnixNow'

export const useFlipPositionLockupKind = () => {
  const { unixNow } = useSolanaUnixNow()
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const { realm } = useRealm()
  const [{ client }] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
  ])
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
        !client ||
        !unixNow ||
        !(client instanceof HeliumVsrClient) ||
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
        const isDao = Boolean(await connection.current.getAccountInfo(dao))
        const positionLockupPeriodInDays = Math.ceil(
          secsToDays(
            isConstant
              ? position.lockup.endTs.sub(position.lockup.startTs).toNumber()
              : position.lockup.endTs.sub(new BN(unixNow)).toNumber()
          )
        )

        if (isDao) {
          instructions.push(
            await hsdProgram.methods
              .resetLockupV0({
                kind,
                periods: positionLockupPeriodInDays,
              } as any)
              .accounts({
                position: position.pubkey,
                dao,
              })
              .instruction()
          )
        } else {
          instructions.push(
            await client.program.methods
              .resetLockupV0({
                kind,
                periods: positionLockupPeriodInDays,
              } as any)
              .accounts({
                position: position.pubkey,
              })
              .instruction()
          )
        }

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
