import create, { State } from 'zustand';

import { FeedItemComment } from '@hub/components/FeedItem/gql';

interface UserCreatedFeedItemCommentRepliesStore extends State {
  comments: {
    [commentId: string]: FeedItemComment[] | undefined;
  };
  addReply: (parentCommentId: string, comment: FeedItemComment) => void;
  updateComment: (parentCommentId: string, comment: FeedItemComment) => void;
}

export const useUserCreatedFeedItemCommentRepliesStore = create<UserCreatedFeedItemCommentRepliesStore>(
  (set, get) => ({
    comments: {},
    addReply: (parentCommentId, comment) => {
      const comments = get().comments;
      const replies = comments[parentCommentId] || [];
      const alreadyExists = !!replies.find((x) => x.id === comment.id);
      const newComments = alreadyExists ? replies : replies.concat(comment);

      set((state) => {
        state.comments[parentCommentId] = newComments;
      });
    },
    updateComment: (parentCommentId, comment) => {
      const comments = get().comments;
      const feedItemComments = comments[parentCommentId] || [];

      const index = feedItemComments.findIndex((x) => x.id === comment.id);

      if (index >= 0) {
        const newComments = feedItemComments.slice();
        newComments[index] = comment;

        set((state) => {
          state.comments[parentCommentId] = newComments;
        });
      }
    },
  }),
);
