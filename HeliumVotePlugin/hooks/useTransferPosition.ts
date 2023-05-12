import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { PositionWithMeta } from '../sdk/types'
import { PROGRAM_ID, init, daoKey } from '@helium/helium-sub-daos-sdk'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import { notify } from '@utils/notifications'
import {
  SequenceType,
  sendTransactionsV3,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'

export const useTransferPosition = () => {
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const [{ client }] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
    s.state.voteStakeRegistryRegistrarPk,
  ])
  const { error, loading, execute } = useAsyncCallback(
    async ({
      sourcePosition,
      amount,
      targetPosition,
      programId = PROGRAM_ID,
    }: {
      sourcePosition: PositionWithMeta
      amount: number
      targetPosition: PositionWithMeta
      programId?: PublicKey
    }) => {
      const isInvalid =
        !connection ||
        !connection.current ||
        !provider ||
        !realm ||
        !mint ||
        !wallet ||
        !client ||
        !(client instanceof HeliumVsrClient)

      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid || !hsdProgram) {
        throw new Error('Unable to Transfer Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []
        const [dao] = daoKey(realm.account.communityMint)
        const isDao = Boolean(await connection.current.getAccountInfo(dao))
        const amountToTransfer = getMintNaturalAmountFromDecimalAsBN(
          amount,
          mint!.decimals
        )

        if (isDao) {
          instructions.push(
            await hsdProgram.methods
              .transferV0({
                amount: amountToTransfer,
              })
              .accounts({
                sourcePosition: sourcePosition.pubkey,
                targetPosition: targetPosition.pubkey,
                depositMint: realm.account.communityMint,
                dao: dao,
              })
              .instruction()
          )
        } else {
          instructions.push(
            await client.program.methods
              .transferV0({
                amount: amountToTransfer,
              })
              .accounts({
                sourcePosition: sourcePosition.pubkey,
                targetPosition: targetPosition.pubkey,
                depositMint: realm.account.communityMint,
              })
              .instruction()
          )
        }

        if (amountToTransfer.eq(sourcePosition.amountDepositedNative)) {
          instructions.push(
            await client.program.methods
              .closePositionV0()
              .accounts({
                position: sourcePosition.pubkey,
              })
              .instruction()
          )
        }

        notify({ message: 'Transfering' })
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
                message: 'Transfer successful',
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
    transferPosition: execute,
  }
}
