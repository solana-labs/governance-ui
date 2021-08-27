import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

export const governanceChatProgramId = new PublicKey(
  'gCHAtYKrUUktTVzE4hEnZdLV4LXrdBf6Hh9qMaJALET'
)

export enum GovernanceChatAccountType {
  Uninitialized = 0,
  ChatMessage = 1,
}

export interface GovernanceChatAccount {
  accountType: GovernanceChatAccountType
}

export type GovernanceChatAccountClass = typeof ChatMessage

export enum ChatMessageBodyType {
  Text = 0,
  Reaction = 1,
}

export class ChatMessageBody {
  type: ChatMessageBodyType
  value: string

  constructor(args: { type: ChatMessageBodyType; value: string }) {
    this.type = args.type
    this.value = args.value
  }
}

export class ChatMessage {
  accountType = GovernanceChatAccountType.ChatMessage

  proposal: PublicKey
  author: PublicKey
  postedAt: BN
  replyTo: PublicKey | undefined
  body: ChatMessageBody

  constructor(args: {
    proposal: PublicKey
    author: PublicKey
    postedAt: BN
    replyTo: PublicKey | undefined
    body: ChatMessageBody
  }) {
    this.proposal = args.proposal
    this.author = args.author
    this.postedAt = args.postedAt
    this.replyTo = args.replyTo
    this.body = args.body
  }
}
