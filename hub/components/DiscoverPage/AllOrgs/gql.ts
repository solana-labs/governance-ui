import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';
import { RealmCategory } from '@hub/types/decoders/RealmCategory';
import { RichTextDocument } from '@hub/types/decoders/RichTextDocument';

export const getRealmsList = gql`
  query realms {
    realmDropdownList {
      iconUrl
      name
      publicKey
      urlId
      realm {
        bannerImageUrl
        category
        shortDescription
        hub {
          info {
            clippedHeading(charLimit: 100) {
              document
              isClipped
            }
          }
          twitterFollowerCount
        }
      }
    }
  }
`;

export const getRealmsListResp = IT.type({
  realmDropdownList: IT.array(
    IT.type({
      iconUrl: IT.union([IT.null, IT.string]),
      name: IT.string,
      publicKey: PublicKey,
      urlId: IT.string,
      realm: IT.type({
        bannerImageUrl: IT.union([IT.null, IT.string]),
        category: RealmCategory,
        shortDescription: IT.union([IT.null, IT.string]),
        hub: IT.type({
          info: IT.type({
            clippedHeading: IT.union([
              IT.null,
              IT.type({
                document: RichTextDocument,
                isClipped: IT.boolean,
              }),
            ]),
          }),
          twitterFollowerCount: IT.number,
        }),
      }),
    }),
  ),
});
