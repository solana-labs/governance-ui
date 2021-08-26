import {
  ChatMessage,
  GovernanceChatAccountClass,
  ChatMessageBody,
} from './accounts'
import { BorshAccountParser } from '../core/serialisation'
import { PostChatMessageArgs } from './instructions'

export const GOVERNANCE_CHAT_SCHEMA = new Map<any, any>([
  [
    ChatMessageBody,
    {
      kind: 'struct',
      fields: [
        ['type', 'u8'],
        ['value', 'string'],
      ],
    },
  ],
  [
    ChatMessage,
    {
      kind: 'struct',
      fields: [
        ['accountType', 'u8'],
        ['proposal', 'pubkey'],
        ['author', 'pubkey'],
        ['postedAt', 'u64'],
        ['replyTo', { kind: 'option', type: 'pubkey' }],
        ['body', ChatMessageBody],
      ],
    },
  ],
  [
    PostChatMessageArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['body', ChatMessageBody],
      ],
    },
  ],
])

export const ChatAccountParser = (classType: GovernanceChatAccountClass) =>
  BorshAccountParser(classType, GOVERNANCE_CHAT_SCHEMA)
