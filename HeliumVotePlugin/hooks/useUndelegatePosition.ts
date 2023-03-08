import useWallet from '@hooks/useWallet'
import { Program } from '@project-serum/anchor'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { sendTransaction } from '@utils/send'
import { PositionWithMeta } from '../sdk/types'
import {
  PROGRAM_ID,
  init,
  delegatedPositionKey,
} from '@helium/helium-sub-daos-sdk'

export const useUndelegatePosition = () => {
  const { connection, wallet, anchorProvider: provider } = useWallet()
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
        throw new Error('Unable to Delegate Position, Invalid params')
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

        const tx = new Transaction()
        tx.add(...instructions)
        await sendTransaction({
          transaction: tx,
          wallet,
          connection: connection.current,
          signers: [],
          sendingMessage: 'Undelegating',
          successMessage: 'Undelegation successful',
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
