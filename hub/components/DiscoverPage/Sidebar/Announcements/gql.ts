import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';
import { RichTextDocument } from '@hub/types/decoders/RichTextDocument';

export const getPost = gql`
  query getPost($ids: [RealmFeedItemID!]!) {
    feedItems(ids: $ids) {
      ... on RealmFeedItemPost {
        id
        clippedDocument(attachmentLimit: 0, charLimit: 35) {
          document
          isClipped
        }
        created
        realm {
          iconUrl
          name
          publicKey
          urlId
        }
        title
      }
    }
  }
`;

export const Post = IT.type({
  clippedDocument: IT.type({
    document: RichTextDocument,
    isClipped: IT.boolean,
  }),
  created: IT.number,
  id: IT.string,
  realm: IT.type({
    iconUrl: IT.union([IT.null, IT.string]),
    name: IT.string,
    publicKey: PublicKey,
    urlId: IT.string,
  }),
  title: IT.string,
});

export type Post = IT.TypeOf<typeof Post>;

export const getPostResp = IT.type({
  feedItems: IT.array(Post),
});
