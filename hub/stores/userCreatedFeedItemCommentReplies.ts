import create, { State } from 'zustand';

import { FeedItemComment } from '@hub/components/FeedItem/gql';

interface UserCreatedFeedItemCommentRepliesStore extends State {
  comments: {
    [commentId: string]: FeedItemComment[] | undefined;
  };
  addReply: (commentId: string, comment: FeedItemComment) => void;
}

export const useUserCreatedFeedItemCommentRepliesStore = create<UserCreatedFeedItemCommentRepliesStore>(
  (set, get) => ({
    comments: {},
    addReply: (commentId, comment) => {
      const comments = get().comments;
      const replies = comments[commentId] || [];
      const alreadyExists = !!replies.find((x) => x.id === comment.id);
      const newComments = alreadyExists ? replies : replies.concat(comment);

      set((state) => {
        state.comments[commentId] = newComments;
      });
    },
  }),
);
