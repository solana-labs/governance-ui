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

export const useCliamAllPositionsRewards = () => {
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
        !positions.every((pos) => pos.isDelegated)

      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid || !hsdProgram) {
        throw new Error('Unable to Claim All Rewards, Invalid params')
      } else {
        const currentEpoch = new BN(unixNow).div(new BN(EPOCH_LENGTH))
        const instructions: TransactionInstruction[][] = []

        for (const [idx, position] of positions.entries()) {
          instructions[idx] = instructions[idx] || []
          const delegatedPosKey = delegatedPositionKey(position.pubkey)[0]
          const delegatedPosAcc = await hsdProgram.account.delegatedPositionV0.fetch(
            delegatedPosKey
          )

          const { lastClaimedEpoch } = delegatedPosAcc
          for (
            let epoch = lastClaimedEpoch.add(new BN(1));
            epoch.lt(currentEpoch);
            epoch = epoch.add(new BN(1))
          ) {
            instructions[idx].push(
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
          }
        }

        const txs: {
          instructionsSet: {
            transactionInstruction: TransactionInstruction
            signers: Keypair[]
          }[]
          sequenceType: SequenceType
        }[][] = []

        for (const [idx, ixs] of instructions.entries()) {
          txs[idx] = txs[idx] || []
          // This is an arbitrary threshold and we assume that up to 4 instructions can be inserted as a single Tx
          const ixsChunks = chunks(ixs, 4)
          txs[idx].push(
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

        await Promise.all(
          txs.map(
            async (tx) =>
              await sendTransactionsV3({
                transactionInstructions: tx,
                wallet,
                connection: connection.current,
              })
          )
        )
      }
    }
  )

  return {
    error,
    loading,
    useCliamAllPositionsRewards: execute,
  }
}
