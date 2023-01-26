import { BN } from '@project-serum/anchor'
import { MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { ProgramAccount, Realm } from '@solana/spl-governance'
import useWallet from '@hooks/useWallet'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { useHeliumVsr } from './useHeliumVsr'
import { positionKey } from '@helium/voter-stake-registry-sdk'
import { sendTransaction } from '@utils/send'
import { truthy } from '../sdk/types'

export const useCreatePosition = ({
  registrarPk,
  realm,
}: {
  registrarPk: PublicKey | undefined
  realm: ProgramAccount<Realm> | undefined
}) => {
  const program = useHeliumVsr()
  const { connection, wallet } = useWallet()
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
      if (connection && registrarPk && realm && program && wallet) {
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
              registrar: registrarPk,
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
              registrar: registrarPk,
              position,
              mint: realm.account.communityMint,
            })
            .instruction()
        )

        const tx = new Transaction()
        tx.add(...instructions)

        await sendTransaction({
          transaction: tx,
          wallet,
          connection: connection.current,
          signers: [mintKeypair].filter(truthy),
          sendingMessage: `Locking`,
          successMessage: `Locking successful`,
        })
      }
    }
  )

  return {
    error,
    loading,
    createPosition: execute,
  }
}
