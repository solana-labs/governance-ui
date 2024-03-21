import { useCallback } from 'react'
import {
  ChatMessageBody,
  ChatMessageBodyType,
  getTokenOwnerRecordAddress,
  GOVERNANCE_CHAT_PROGRAM_ID,
  withPostChatMessage,
} from '@solana/spl-governance'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { Keypair, TransactionInstruction } from '@solana/web3.js'
import useUserOrDelegator from './useUserOrDelegator'

/** This is WIP and shouldn't be used
 * @deprecated
 */
const useCreatePostMessageIx = () => {
  // get info
  const realm = useRealmQuery().data?.result
  const walletPk = useWalletOnePointOh()?.publicKey ?? undefined
  const actingWalletPk = useUserOrDelegator()
  const votingPluginClient = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const proposal = useRouteProposalQuery().data?.result

  return useCallback(
    async (message: string) => {
      if (
        proposal === undefined ||
        realm === undefined ||
        actingWalletPk === undefined ||
        walletPk === undefined
      )
        throw new Error()

      const instructions: TransactionInstruction[] = []
      const signers: Keypair[] = []
      const createNftTicketsIxs: TransactionInstruction[] = []

      // UX choice: I decided to make the user vote with their own wallet even if there is a selected delegator
      const userTorPk = await getTokenOwnerRecordAddress(
        realm.owner,
        realm.pubkey,
        proposal.account.governingTokenMint,
        actingWalletPk
      )

      const plugin = await votingPluginClient?.withUpdateVoterWeightRecord(
        instructions,
        userTorPk,
        'commentProposal',
        createNftTicketsIxs
      )

      const body = new ChatMessageBody({
        type: ChatMessageBodyType.Text,
        value: message,
      })

      await withPostChatMessage(
        instructions,
        signers,
        GOVERNANCE_CHAT_PROGRAM_ID,
        realm.owner,
        realm.pubkey,
        proposal.account.governance,
        proposal.pubkey,
        userTorPk,
        actingWalletPk,
        walletPk,
        undefined,
        body,
        plugin?.voterWeightPk
      )
    },
    [actingWalletPk, proposal, realm, votingPluginClient, walletPk]
  )
}

export default useCreatePostMessageIx
