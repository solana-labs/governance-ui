import useWalletDeprecated from '@hooks/useWalletDeprecated'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { sendTransaction } from '@utils/send'
import { PositionWithMeta } from '../sdk/types'
import { PROGRAM_ID, init, daoKey } from '@helium/helium-sub-daos-sdk'
import { secsToDays } from '@utils/dateTools'
import useRealm from '@hooks/useRealm'

export const useUnlockPosition = () => {
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const { realm } = useRealm()
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
        position.numActiveVotes > 0

      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid) {
        throw new Error('Unable to Unlock Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []
        const [dao] = daoKey(realm.account.communityMint)

        instructions.push(
          await hsdProgram.methods
            .resetLockupV0({
              kind: { cliff: {} },
              periods: secsToDays(
                position.lockup.endTs.sub(position.lockup.startTs).toNumber()
              ),
            } as any)
            .accounts({
              position: position.pubkey,
              dao: dao,
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
          sendingMessage: `Unlocking`,
          successMessage: `Unlocking successful`,
        })
      }
    }
  )

  return {
    error,
    loading,
    unlockPosition: execute,
  }
}
