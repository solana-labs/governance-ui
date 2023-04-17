import { Program } from '@coral-xyz/anchor'
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
import { PositionWithMeta } from '../sdk/types'
import { PROGRAM_ID, init, daoKey } from '@helium/helium-sub-daos-sdk'
import useRealm from '@hooks/useRealm'
import { LockupKind } from 'HeliumVotePlugin/components/LockTokensModal'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import { positionKey } from '@helium/voter-stake-registry-sdk'
import { notify } from '@utils/notifications'
import {
  sendTransactionsV3,
  SequenceType,
  txBatchesToInstructionSetWithSigners,
} from '@utils/sendTransactions'
import { chunks } from '@utils/helpers'

export const useSplitPosition = () => {
  const { connection, wallet, anchorProvider: provider } = useWalletDeprecated()
  const { mint, realm, realmInfo } = useRealm()
  const [{ client }, registrarPk] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
    s.state.voteStakeRegistryRegistrarPk,
  ])
  const { error, loading, execute } = useAsyncCallback(
    async ({
      sourcePosition,
      amount,
      lockupKind = LockupKind.cliff,
      lockupPeriodsInDays,
      tokenOwnerRecordPk,
      programId = PROGRAM_ID,
    }: {
      sourcePosition: PositionWithMeta
      amount: number
      lockupKind: LockupKind
      lockupPeriodsInDays: number
      tokenOwnerRecordPk: PublicKey | null
      programId?: PublicKey
    }) => {
      const isInvalid =
        !connection ||
        !connection.current ||
        !provider ||
        !realm ||
        !registrarPk ||
        !realm ||
        !client ||
        !(client instanceof HeliumVsrClient) ||
        !wallet ||
        !realmInfo ||
        !realmInfo.programVersion ||
        !mint ||
        !wallet

      const idl = await Program.fetchIdl(programId, provider)
      const hsdProgram = await init(provider as any, programId, idl)

      if (loading) return

      if (isInvalid || !hsdProgram) {
        throw new Error('Unable to Split Position, Invalid params')
      } else {
        const mintKeypair = Keypair.generate()
        const [dao] = daoKey(realm.account.communityMint)
        const [targetPosition] = positionKey(mintKeypair.publicKey)
        const instructions: TransactionInstruction[] = []
        const mintRent = await connection.current.getMinimumBalanceForRentExemption(
          MintLayout.span
        )
        const amountToTransfer = getMintNaturalAmountFromDecimalAsBN(
          amount,
          mint!.decimals
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
            targetPosition,
            targetPosition
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
          await hsdProgram.methods
            .transferV0({
              amount: amountToTransfer,
            })
            .accounts({
              sourcePosition: sourcePosition.pubkey,
              targetPosition: targetPosition,
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

        // This is an arbitrary threshold and we assume that up to 2 instructions can be inserted as a single Tx
        const ixsChunks = chunks(instructions, 2)
        const txsChunks = ixsChunks.map((txBatch, batchIdx) => ({
          instructionsSet: txBatchesToInstructionSetWithSigners(
            txBatch,
            [[mintKeypair], [], []],
            batchIdx
          ),
          sequenceType: SequenceType.Sequential,
        }))

        notify({ message: 'Spliting Position' })
        await sendTransactionsV3({
          transactionInstructions: txsChunks,
          wallet,
          connection: connection.current,
          callbacks: {
            afterAllTxConfirmed: () =>
              notify({
                message: 'Spliting successful',
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
    splitPosition: execute,
  }
}
