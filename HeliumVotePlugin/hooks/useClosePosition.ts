import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { BN } from '@coral-xyz/anchor'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { PositionWithMeta } from '../sdk/types'
import useRealm from '@hooks/useRealm'
import { useSolanaUnixNow } from '@hooks/useSolanaUnixNow'
import { SequenceType } from '@blockworks-foundation/mangolana/lib/globalTypes'
import { notify } from '@utils/notifications'
import {
  sendTransactionsV3,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { withCreateTokenOwnerRecord } from '@solana/spl-governance'
import { useRealmQuery } from '@hooks/queries/realm'
import {useHeliumClient} from "../../VoterWeightPlugins/useHeliumClient";

export const useClosePosition = () => {
  const { unixNow } = useSolanaUnixNow()
  const { connection, wallet } = useWalletDeprecated()
  const realm = useRealmQuery().data?.result
  const { realmInfo } = useRealm()
  const { heliumClient } = useHeliumClient();
  const { error, loading, execute } = useAsyncCallback(
    async ({
      position,
      tokenOwnerRecordPk,
    }: {
      position: PositionWithMeta
      tokenOwnerRecordPk: PublicKey | null
    }) => {
      const lockup = position.lockup
      const lockupKind = Object.keys(lockup.kind)[0]
      const isInvalid =
        !connection ||
        !connection.current ||
        !realm ||
        !realmInfo ||
        !heliumClient ||
        !wallet ||
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
          await heliumClient.program.methods
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
          await heliumClient.program.methods
            .closePositionV0()
            .accounts({
              position: position.pubkey,
            })
            .instruction()
        )

        notify({ message: 'Closing' })
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
                message: 'Closed successful',
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
    closePosition: execute,
  }
}
