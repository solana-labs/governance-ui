import * as IT from 'io-ts';
import { gql } from 'urql';

import { Post, Realm, SpotlightItem } from '@hub/components/DiscoverPage/gql';
import { PublicKey } from '@hub/types/decoders/PublicKey';

export { Realm, SpotlightItem };

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

const discoverPageDetails = `
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
`;

const discoverPage = IT.type({
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
});

export const getDiscoverPage = gql`
  query {
    me {
      amSiteAdmin
      publicKey
    }
    discoverPage {
      ${discoverPageDetails}
    }
  }
`;

export const updateDiscoverPage = gql`
  mutation ($data: DiscoverPageInput!) {
    updateDiscoverPage(data: $data) {
      ${discoverPageDetails}
    }
  }
`;

export const getDiscoverPageResp = IT.type({
  me: IT.union([
    IT.null,
    IT.type({
      amSiteAdmin: IT.union([IT.null, IT.boolean]),
      publicKey: PublicKey,
    }),
  ]),
  discoverPage,
});

export const updateDiscoverPageResp = IT.type({
  updateDiscoverPage: discoverPage,
});
