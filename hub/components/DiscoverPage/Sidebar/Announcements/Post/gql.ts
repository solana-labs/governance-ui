import * as IT from 'io-ts';
import { gql } from 'urql';

import { RichTextDocument } from '@hub/types/decoders/RichTextDocument';

export const getPost = gql`
  query getPost($id: RealmFeedItemID!, $realm: PublicKey!) {
    feedItem(id: $id, realm: $realm) {
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
          urlId
        }
        title
      }
    }
  }
`;

export const getPostResp = IT.type({
  feedItem: IT.type({
    clippedDocument: IT.type({
      document: RichTextDocument,
      isClipped: IT.boolean,
    }),
    created: IT.number,
    id: IT.string,
    realm: IT.type({
      iconUrl: IT.union([IT.null, IT.string]),
      name: IT.string,
      urlId: IT.string,
    }),
    title: IT.string,
  }),
});
