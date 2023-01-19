import { BN } from '@project-serum/anchor'
import { MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { ProgramAccount, Realm } from '@solana/spl-governance'
import useWallet from '@hooks/useWallet'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
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
  const { connection, anchorProvider, wallet } = useWallet()
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
      if (connection && registrar && realm && program && wallet) {
        if (loading) return
        const mintKeypair = Keypair.generate()
        const position = positionKey(mintKeypair.publicKey)[0]
        const instructions: TransactionInstruction[] = []
        const mintRent = await connection.current.getMinimumBalanceForRentExemption(
          MintLayout.span
        )
        instructions.push(
          SystemProgram.createAccount({
            fromPubkey: wallet!.publicKey!,
            newAccountPubkey: mintKeypair.publicKey,
            lamports: mintRent,
            space: MintLayout.span,
            programId: TOKEN_PROGRAM_ID,
          })
        )

        instructions.push(
          Token.createInitMintInstruction(
            TOKEN_PROGRAM_ID,
            mintKeypair.publicKey,
            0,
            position,
            position
          )
        )

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
              recipient: wallet!.publicKey!,
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

        console.log('mint', mintKeypair.publicKey.toBase58())
        console.log('registrar', registrar.toBase58())
        console.log('recipient', wallet!.publicKey!.toBase58())
        console.log('position', position.toBase58())
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
