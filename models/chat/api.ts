import { PublicKey } from '@solana/web3.js'

import {
  getBorshProgramAccounts,
  MemcmpFilter,
  pubkeyFilter,
} from '../core/api'
import { ChatMessage, governanceChatProgramId } from './accounts'

import { GOVERNANCE_CHAT_SCHEMA } from './serialisation'

export function getGovernanceChatMessages(
  endpoint: string,
  proposal: PublicKey
) {
  return getBorshProgramAccounts<ChatMessage>(
    governanceChatProgramId,
    GOVERNANCE_CHAT_SCHEMA,
    endpoint,
    ChatMessage,
    [pubkeyFilter(1, proposal) as MemcmpFilter]
  )
}

export function getGovernanceChatMessagesByVoter(
  endpoint: string,
  voter: PublicKey
) {
  return getBorshProgramAccounts<ChatMessage>(
    governanceChatProgramId,
    GOVERNANCE_CHAT_SCHEMA,
    endpoint,
    ChatMessage,
    [pubkeyFilter(33, voter) as MemcmpFilter]
  )
}
