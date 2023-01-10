import { BN } from '@coral-xyz/anchor'
import { MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { withCreateTokenOwnerRecord } from '@solana/spl-governance'
import useWallet from '@hooks/useWallet'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { positionKey } from '@helium/voter-stake-registry-sdk'
import { sendTransaction } from '@utils/send'
import { truthy } from '@utils/truthy'
import useRealm from '@hooks/useRealm'
import { LockupKind } from 'HeliumVotePlugin/components/LockTokensModal'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'

export const useCreatePosition = () => {
  const { connection, wallet } = useWallet()
  const { realm, realmInfo } = useRealm()
  const [{ client }, registrarPk] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
    s.state.voteStakeRegistryRegistrarPk,
  ])
  const { error, loading, execute } = useAsyncCallback(
    async ({
      amount,
      lockupKind = LockupKind.cliff,
      lockupPeriodsInDays,
      tokenOwnerRecordPk,
    }: {
      amount: BN
      lockupKind: LockupKind
      lockupPeriodsInDays: number
      tokenOwnerRecordPk: PublicKey | null
    }) => {
      const isInvalid =
        !connection ||
        !connection.current ||
        !registrarPk ||
        !realm ||
        !client ||
        !(client instanceof HeliumVsrClient) ||
        !wallet ||
        !realmInfo ||
        !realmInfo.programVersion

      if (loading) return

      if (isInvalid) {
        throw new Error('Unable to Create Position, Invalid params')
      } else {
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

        if (!tokenOwnerRecordPk) {
          await withCreateTokenOwnerRecord(
            instructions,
            realm.owner,
            realmInfo.programVersion!,
            realm.pubkey,
            wallet!.publicKey!,
            realm.account.communityMint,
            wallet!.publicKey!
          )
        }

        instructions.push(
          await client.program.methods
            .initializePositionV0({
              kind: { [lockupKind]: {} },
              periods: lockupPeriodsInDays,
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
          await client.program.methods
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
