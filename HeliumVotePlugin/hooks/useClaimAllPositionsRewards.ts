import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { Program, BN } from '@coral-xyz/anchor'
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { PositionWithMeta } from '../sdk/types'
import {
  PROGRAM_ID,
  EPOCH_LENGTH,
  init,
  delegatedPositionKey,
} from '@helium/helium-sub-daos-sdk'
import { useSolanaUnixNow } from '@hooks/useSolanaUnixNow'
import { chunks } from '@utils/helpers'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { notify } from '@utils/notifications'
import useRealm from '@hooks/useRealm'

export const useClaimAllPositionsRewards = () => {
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const { unixNow } = useSolanaUnixNow()
  const { realm, realmInfo } = useRealm()
  const { error, loading, execute } = useAsyncCallback(
    async ({
      positions,
      programId = PROGRAM_ID,
    }: {
      positions: PositionWithMeta[]
      programId?: PublicKey
    }) => {
      const isInvalid =
        !unixNow ||
        !connection ||
        !connection.current ||
        !provider ||
        !wallet ||
        !realm ||
        !realmInfo ||
        !positions.every((pos) => pos.hasRewards)

      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid || !hsdProgram) {
        throw new Error('Unable to Claim All Rewards, Invalid params')
      } else {
        const currentEpoch = new BN(unixNow).div(new BN(EPOCH_LENGTH))
        const multiDemArray: TransactionInstruction[][] = []

        for (const [idx, position] of positions.entries()) {
          multiDemArray[idx] = multiDemArray[idx] || []
          const delegatedPosKey = delegatedPositionKey(position.pubkey)[0]
          const delegatedPosAcc = await hsdProgram.account.delegatedPositionV0.fetch(
            delegatedPosKey
          )

          const { lastClaimedEpoch } = delegatedPosAcc
          let epoch = lastClaimedEpoch.add(new BN(1))

          while (epoch.lt(currentEpoch)) {
            multiDemArray[idx].push(
              await hsdProgram.methods
                .claimRewardsV0({
                  epoch,
                })
                .accounts({
                  position: position.pubkey,
                  subDao: delegatedPosAcc.subDao,
                })
                .instruction()
            )
            epoch = epoch.add(new BN(1))
          }
        }

        const txsChunks: {
          instructionsSet: {
            transactionInstruction: TransactionInstruction
            signers: Keypair[]
          }[]
          sequenceType: SequenceType
        }[] = []

        for (const positionInsturctions of multiDemArray) {
          // This is an arbitrary threshold and we assume that up to 4 instructions can be inserted as a single Tx
          const ixsChunks = chunks(positionInsturctions, 4)
          txsChunks.push(
            ...ixsChunks.map((txBatch, batchIdx) => ({
              instructionsSet: txBatchesToInstructionSetWithSigners(
                txBatch,
                [],
                batchIdx
              ),
              sequenceType: SequenceType.Sequential,
            }))
          )
        }

        notify({ message: 'Claiming Rewards' })
        await sendTransactionsV3({
          transactionInstructions: txsChunks,
          wallet,
          connection: connection.current,
          callbacks: {
            afterAllTxConfirmed: () =>
              notify({
                message: 'Claiming Rewards successful',
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
    claimAllPositionsRewards: execute,
  }
}
