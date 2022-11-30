import create, { State } from 'zustand';

import { FeedItemComment } from '@hub/components/FeedItem/gql';

interface UserCreatedTopLevelFeedItemRepliesStore extends State {
  comments: {
    [feedItemId: string]: FeedItemComment[] | undefined;
  };
  deletedComments: string[];
  addComment: (feedItemId: string, comment: FeedItemComment) => void;
  deleteComment: (commentId: string) => void;
  updateComment: (feedItemId: string, comment: FeedItemComment) => void;
}

export const useUserCreatedTopLevelFeedItemRepliesStore = create<UserCreatedTopLevelFeedItemRepliesStore>(
  (set, get) => ({
    comments: {},
    deletedComments: [],
    addComment: (feedItemId, comment) => {
      const comments = get().comments;
      const feedItemComments = comments[feedItemId] || [];
      const alreadyExists = !!feedItemComments.find((x) => x.id === comment.id);

      const newComments = alreadyExists
        ? feedItemComments
        : feedItemComments.concat(comment);

      set((state) => {
        state.comments[feedItemId] = newComments;
      });
    },
    deleteComment: (commentId: string) => {
      set((state) => {
        state.deletedComments.push(commentId);
      });
    },
    updateComment: (feedItemId, comment) => {
      const comments = get().comments;
      const feedItemComments = comments[feedItemId] || [];

      const index = feedItemComments.findIndex((x) => x.id === comment.id);

      if (index >= 0) {
        const newComments = feedItemComments.slice();
        newComments[index] = comment;

        set((state) => {
          state.comments[feedItemId] = newComments;
        });
      }
    },
  }),
);
