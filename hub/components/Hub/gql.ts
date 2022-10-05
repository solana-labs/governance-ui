import * as IT from 'io-ts';
import { gql } from 'urql';

import { HubInfoRoadmapItemStatus } from '@hub/types/decoders/HubInfoRoadmapItemStatus';
import { PublicKey } from '@hub/types/decoders/PublicKey';
import { RichTextDocument } from '@hub/types/decoders/RichTextDocument';

export const getHub = gql`
  query getHub($realm: PublicKey!) {
    hub(realm: $realm) {
      realm
      twitterFollowerCount
      info {
        about {
          content
          heading
        }
        documentation {
          title
          url
        }
        faq {
          answer
          question
        }
        gallery {
          caption
          height
          width
          url
        }
        heading
        resources {
          content
          title
          url
        }
        roadmap {
          description
          items {
            date
            resource {
              content
              title
              url
            }
            status
            title
          }
        }
        team {
          avatar
          description
          name
          role
          twitter
        }
        token {
          mint
          price
          symbol
        }
      }
    }
    realm(publicKey: $realm) {
      bannerImageUrl
      iconUrl
      membersCount
      name
      publicKey
      symbol
      twitterHandle
      websiteUrl
    }
  }
`;

export const getHubResp = IT.type({
  hub: IT.type({
    realm: PublicKey,
    twitterFollowerCount: IT.number,
    info: IT.type({
      about: IT.array(
        IT.type({
          content: RichTextDocument,
          heading: IT.union([IT.null, IT.string]),
        }),
      ),
      documentation: IT.union([
        IT.null,
        IT.type({
          title: IT.union([IT.null, IT.string]),
          url: IT.string,
        }),
      ]),
      faq: IT.array(
        IT.type({
          answer: RichTextDocument,
          question: IT.string,
        }),
      ),
      gallery: IT.array(
        IT.type({
          caption: IT.union([IT.null, IT.string]),
          url: IT.string,
          height: IT.number,
          width: IT.number,
        }),
      ),
      heading: IT.union([IT.null, RichTextDocument]),
      resources: IT.array(
        IT.type({
          content: IT.union([IT.null, RichTextDocument]),
          title: IT.string,
          url: IT.string,
        }),
      ),
      roadmap: IT.type({
        description: IT.union([IT.null, RichTextDocument]),
        items: IT.array(
          IT.type({
            date: IT.union([IT.null, IT.number]),
            resource: IT.union([
              IT.null,
              IT.type({
                content: IT.union([IT.null, RichTextDocument]),
                title: IT.string,
                url: IT.string,
              }),
            ]),
            status: IT.union([IT.null, HubInfoRoadmapItemStatus]),
            title: IT.string,
          }),
        ),
      }),
      team: IT.array(
        IT.type({
          avatar: IT.union([IT.null, IT.string]),
          description: IT.union([IT.null, RichTextDocument]),
          name: IT.string,
          role: IT.union([IT.null, IT.string]),
          twitter: IT.union([IT.null, IT.string]),
        }),
      ),
      token: IT.union([
        IT.null,
        IT.type({
          mint: PublicKey,
          price: IT.number,
          symbol: IT.string,
        }),
      ]),
    }),
  }),
  realm: IT.type({
    bannerImageUrl: IT.union([IT.null, IT.string]),
    iconUrl: IT.union([IT.null, IT.string]),
    membersCount: IT.number,
    name: IT.string,
    publicKey: PublicKey,
    symbol: IT.union([IT.null, IT.string]),
    twitterHandle: IT.union([IT.null, IT.string]),
    websiteUrl: IT.union([IT.null, IT.string]),
  }),
});
