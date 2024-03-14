import { useCallback } from 'react'
import {
  ChatMessageBody,
  ChatMessageBodyType,
  getTokenOwnerRecordAddress,
  GOVERNANCE_CHAT_PROGRAM_ID,
  withPostChatMessage,
} from '@solana/spl-governance'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { Keypair, TransactionInstruction } from '@solana/web3.js'
import useUserOrDelegator from './useUserOrDelegator'
import {useRealmVoterWeightPlugins} from "@hooks/useRealmVoterWeightPlugins";
import {convertTypeToVoterWeightAction} from "../VoterWeightPlugins";

/** This is WIP and shouldn't be used
 * @deprecated
 */
const useCreatePostMessageIx = () => {
  // get info
  const realm = useRealmQuery().data?.result
  const walletPk = useWalletOnePointOh()?.publicKey ?? undefined
  const actingWalletPk = useUserOrDelegator()
  const { updateVoterWeightRecords, voterWeightPks, voterWeightPkForWallet } = useRealmVoterWeightPlugins();
  const voterWeightPk = actingWalletPk ? voterWeightPkForWallet(actingWalletPk) : undefined;
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
        const updateVWRInstructions = await updateVoterWeightRecords(actingWalletPk, convertTypeToVoterWeightAction('commentProposal'));

      instructions.push(...updateVWRInstructions.pre);
      createNftTicketsIxs.push(...updateVWRInstructions.post);

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
        voterWeightPk
      )
    },
    [actingWalletPk, proposal, realm, voterWeightPks, walletPk]
  )
}

export default useCreatePostMessageIx
