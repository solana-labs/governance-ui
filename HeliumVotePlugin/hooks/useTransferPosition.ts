import useWallet from '@hooks/useWallet'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useAsyncCallback } from 'react-async-hook'
import { sendTransaction } from '@utils/send'
import { PositionWithMeta } from '../sdk/types'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { secsToDays } from 'VoteStakeRegistry/tools/dateTools'

export const useTransferPosition = ({
  registrarPk,
}: {
  registrarPk: PublicKey | undefined
}) => {
  const { client } = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const { connection, wallet } = useWallet()
  const { realm, realmInfo } = useRealm()
  const { error, loading, execute } = useAsyncCallback(
    async ({
      sourcePosition,
      targetPosition,
    }: {
      sourcePosition: PositionWithMeta
      targetPosition: PositionWithMeta
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
        !realmInfo.programVersion ||
        sourcePosition.numActiveVotes > 0 ||
        targetPosition.numActiveVotes > 0

      if (loading) return

      if (isInvalid) {
        throw new Error('Unable to Transfer Position, Invalid params')
      } else {
        const instructions: TransactionInstruction[] = []

        instructions.push(
          await client.program.methods
            .transferV0({
              amount: sourcePosition.amountDepositedNative,
            })
            .accounts({
              sourcePosition: sourcePosition.pubkey,
              targetPosition: targetPosition.pubkey,
              depositMint: realm.account.communityMint,
            })
            .instruction()
        )

        instructions.push(
          await client.program.methods
            .closePositionV0()
            .accounts({
              position: sourcePosition.pubkey,
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
