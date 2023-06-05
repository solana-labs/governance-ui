import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';
import { RealmCategory } from '@hub/types/decoders/RealmCategory';
import { RichTextDocument } from '@hub/types/decoders/RichTextDocument';
import { RoadmapItemStatus } from '@hub/types/decoders/RoadmapItemStatus';

export const getHub = gql`
  query getHub($urlId: String!) {
    realmByUrlId(urlId: $urlId) {
      amAdmin
      bannerImageUrl
      category
      discordUrl
      displayName
      githubUrl
      heading
      iconUrl
      instagramUrl
      linkedInUrl
      membersCount
      name
      publicKey
      symbol
      twitterFollowerCount
      twitterHandle
      websiteUrl
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
        clippedAnswer(charLimit: 200) {
          document
          isClipped
        }
        question
      }
      gallery {
        caption
        height
        width
        url
      }
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
        linkedIn
        name
        role
        twitter
        twitterFollowerCount
      }
      token {
        mint
        symbol
      }
    }
  }
`;

export const getHubResp = IT.type({
  realmByUrlId: IT.type({
    amAdmin: IT.boolean,
    bannerImageUrl: IT.union([IT.null, IT.string]),
    category: RealmCategory,
    discordUrl: IT.union([IT.null, IT.string]),
    displayName: IT.union([IT.null, IT.string]),
    githubUrl: IT.union([IT.null, IT.string]),
    heading: IT.union([IT.null, RichTextDocument]),
    iconUrl: IT.union([IT.null, IT.string]),
    instagramUrl: IT.union([IT.null, IT.string]),
    linkedInUrl: IT.union([IT.null, IT.string]),
    membersCount: IT.number,
    name: IT.string,
    publicKey: PublicKey,
    symbol: IT.union([IT.null, IT.string]),
    twitterFollowerCount: IT.number,
    twitterHandle: IT.union([IT.null, IT.string]),
    websiteUrl: IT.union([IT.null, IT.string]),
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
        clippedAnswer: IT.type({
          document: RichTextDocument,
          isClipped: IT.boolean,
        }),
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
          status: IT.union([IT.null, RoadmapItemStatus]),
          title: IT.string,
        }),
      ),
    }),
    team: IT.array(
      IT.type({
        avatar: IT.union([IT.null, IT.string]),
        description: IT.union([IT.null, RichTextDocument]),
        linkedIn: IT.union([IT.null, IT.string]),
        name: IT.string,
        role: IT.union([IT.null, IT.string]),
        twitter: IT.union([IT.null, IT.string]),
        twitterFollowerCount: IT.number,
      }),
    ),
    token: IT.union([
      IT.null,
      IT.type({
        mint: PublicKey,
        symbol: IT.string,
      }),
    ]),
  }),
});
