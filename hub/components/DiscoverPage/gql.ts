import * as IT from 'io-ts';
import { gql } from 'urql';

import { PublicKey } from '@hub/types/decoders/PublicKey';
import { RealmCategory } from '@hub/types/decoders/RealmCategory';
import { RichTextDocument } from '@hub/types/decoders/RichTextDocument';

const realmDetails = `
  bannerImageUrl
  category
  displayName
  iconUrl
  name
  publicKey
  shortDescription
  twitterFollowerCount
  urlId
  clippedHeading(charLimit: 100) {
    document
    isClipped
  }
`;

export const getDiscoverPage = gql`
  query {
    discoverPage {
      daoTooling {
        ${realmDetails}
      }
      defi {
        ${realmDetails}
      }
      gaming {
        ${realmDetails}
      }
      hackathonWinners {
        ${realmDetails}
      }
      keyAnnouncements {
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
      nftCollections {
        ${realmDetails}
      }
      popular {
        ${realmDetails}
      }
      spotlight {
        heroImageUrl
        title
        publicKey
        description
        realm {
          urlId
        }
        stats {
          value
          label
        }
      }
      trending {
        ${realmDetails}
      }
      version
      web3 {
        ${realmDetails}
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

export const Realm = IT.type({
  bannerImageUrl: IT.union([IT.null, IT.string]),
  category: RealmCategory,
  displayName: IT.union([IT.null, IT.string]),
  iconUrl: IT.union([IT.null, IT.string]),
  name: IT.string,
  publicKey: PublicKey,
  shortDescription: IT.union([IT.null, IT.string]),
  twitterFollowerCount: IT.number,
  urlId: IT.string,
  clippedHeading: IT.union([
    IT.null,
    IT.type({
      document: RichTextDocument,
      isClipped: IT.boolean,
    }),
  ]),
});

export type Realm = IT.TypeOf<typeof Realm>;

export const SpotlightItem = IT.type({
  heroImageUrl: IT.string,
  title: IT.string,
  publicKey: PublicKey,
  description: IT.string,
  realm: IT.type({
    urlId: IT.string,
  }),
  stats: IT.array(
    IT.type({
      value: IT.string,
      label: IT.string,
    }),
  ),
});

export type SpotlightItem = IT.TypeOf<typeof SpotlightItem>;

export const getDiscoverPageResp = IT.type({
  discoverPage: IT.type({
    daoTooling: IT.array(Realm),
    defi: IT.array(Realm),
    gaming: IT.array(Realm),
    hackathonWinners: IT.array(Realm),
    keyAnnouncements: IT.array(Post),
    nftCollections: IT.array(Realm),
    popular: IT.array(Realm),
    spotlight: IT.array(SpotlightItem),
    trending: IT.array(Realm),
    version: IT.number,
    web3: IT.array(Realm),
  }),
});
