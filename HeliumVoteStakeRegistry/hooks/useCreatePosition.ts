import { BN } from '@project-serum/anchor'
import { ProgramAccount, Realm } from '@solana/spl-governance'
import useWallet from '@hooks/useWallet'
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { useHeliumVsr } from './useHeliumVsr'
import { positionKey } from '@helium/voter-stake-registry-sdk'
import { sendInstructions } from '@helium/spl-utils'

export type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T // from lodash
export const truthy = <T>(value: T): value is Truthy<T> => !!value
export const useCreatePosition = ({
  registrar,
  realm,
}: {
  registrar: PublicKey | undefined
  realm: ProgramAccount<Realm> | undefined
}) => {
  const program = useHeliumVsr()
  const { anchorProvider, wallet } = useWallet()
  const { error, loading, execute } = useAsyncCallback(
    async ({
      amount,
      kind = { cliff: {} },
      periods,
    }: {
      amount: BN
      kind: { [key in 'cliff' | 'constant']?: Record<string, never> }
      periods: number
    }) => {
      if (registrar && realm && program && wallet) {
        if (loading) return
        const mintKeypair = Keypair.generate()
        const position = positionKey(mintKeypair.publicKey)[0]
        const instructions: TransactionInstruction[] = []
        instructions.push(
          await program.methods
            .initializePositionV0({
              kind,
              periods,
            } as any)
            .accounts({
              registrar,
              mint: mintKeypair.publicKey,
              depositMint: realm.account.communityMint,
              recipient: wallet.publicKey || undefined,
            })
            .instruction()
        )

        instructions.push(
          await program.methods
            .depositV0({
              amount,
            })
            .accounts({
              registrar,
              position,
              mint: realm.account.communityMint,
            })
            .instruction()
        )

        await sendInstructions(
          anchorProvider as any,
          instructions,
          [mintKeypair].filter(truthy)
        )
      }
    }
  )

  return {
    error,
    loading,
    createPosition: execute,
  }
}
