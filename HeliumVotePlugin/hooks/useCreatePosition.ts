import { BN } from '@coral-xyz/anchor'
import { MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { withCreateTokenOwnerRecord } from '@solana/spl-governance'
import useWalletDeprecated from '@hooks/useWalletDeprecated'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { positionKey } from '@helium/voter-stake-registry-sdk'
import useRealm from '@hooks/useRealm'
import { LockupKind } from 'HeliumVotePlugin/components/LockTokensModal'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { notify } from '@utils/notifications'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'

export const useCreatePosition = () => {
  const { connection, wallet } = useWalletDeprecated()
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

        notify({ message: 'Locking' })
        await sendTransactionsV3({
          transactionInstructions: [
            {
              instructionsSet: txBatchesToInstructionSetWithSigners(
                instructions,
                [[mintKeypair]],
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
                message: 'Locking successful',
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
    createPosition: execute,
  }
}
