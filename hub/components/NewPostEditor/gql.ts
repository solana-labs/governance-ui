import * as IT from 'io-ts';
import { gql } from 'urql';

import { feedItemPostParts, FeedItemPost } from '@hub/components/Home/Feed/gql';

export const createPost = gql`
  mutation submitPost(
    $realm: PublicKey!
    $title: String!
    $document: RichTextDocument!
  ) {
    createPost(document: $document, realm: $realm, title: $title) {
      ${feedItemPostParts}
    }
  }
`;

export const createPostResp = IT.type({
  createPost: FeedItemPost,
});
