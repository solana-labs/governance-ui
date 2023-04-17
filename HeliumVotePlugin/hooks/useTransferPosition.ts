import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { sendTransaction } from '@utils/send'
import { PositionWithMeta } from '../sdk/types'
import { PROGRAM_ID, init, daoKey } from '@helium/helium-sub-daos-sdk'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'

export const useTransferPosition = () => {
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const { mint, realm } = useRealm()
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
        const amountToTransfer = getMintNaturalAmountFromDecimalAsBN(
          amount,
          mint!.decimals
        )

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

        const tx = new Transaction()
        tx.add(...instructions)
        await sendTransaction({
          transaction: tx,
          wallet,
          connection: connection.current,
          signers: [],
          sendingMessage: `Transfering`,
          successMessage: `Transfer successful`,
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
