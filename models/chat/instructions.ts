import { ChatMessageBody } from './accounts'

export enum GovernanceChatInstruction {
  PostMessage = 0,
}

export class PostChatMessageArgs {
  instruction: GovernanceChatInstruction = GovernanceChatInstruction.PostMessage
  body: ChatMessageBody

  constructor(args: { body: ChatMessageBody }) {
    this.body = args.body
  }
}
