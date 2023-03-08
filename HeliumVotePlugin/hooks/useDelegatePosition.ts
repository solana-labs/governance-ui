import useWallet from '@hooks/useWallet'
import { Program } from '@project-serum/anchor'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { sendTransaction } from '@utils/send'
import { PositionWithMeta, SubDaoWithMeta } from '../sdk/types'
import { PROGRAM_ID, init } from '@helium/helium-sub-daos-sdk'

export const useDelegatePosition = () => {
  const { connection, wallet, anchorProvider: provider } = useWallet()
  const { error, loading, execute } = useAsyncCallback(
    async ({
      position,
      subDao,
      programId = PROGRAM_ID,
    }: {
      position: PositionWithMeta
      subDao: SubDaoWithMeta
      programId?: PublicKey
    }) => {
      const isInvalid =
        !connection ||
        !connection.current ||
        !provider ||
        !wallet ||
        position.isDelegated

      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid || !hsdProgram) {
        throw new Error('Unable to Delegate Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []

        instructions.push(
          await hsdProgram.methods
            .delegateV0()
            .accounts({
              position: position.pubkey,
              subDao: subDao.pubkey,
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
          sendingMessage: 'Delegating',
          successMessage: 'Delegation successful',
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
