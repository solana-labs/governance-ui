import ArrowRightIcon from '@carbon/icons-react/lib/ArrowRight';
import ImageIcon from '@carbon/icons-react/lib/Image';
import LocationStarIcon from '@carbon/icons-react/lib/LocationStar';
import OrderDetailsIcon from '@carbon/icons-react/lib/OrderDetails';
import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
// @ts-ignore
import DicomOverlayIcon from '@carbon/icons-react/lib/watson-health/DicomOverlay';
import * as Tabs from '@radix-ui/react-tabs';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Primary, Secondary } from '@components/core/controls/Button';
import { FaqOutline as FaqIcon } from '@hub/components/icons/FaqOutline';
import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import { getDimensions } from '@hub/lib/image';
import { toPlainText } from '@hub/lib/richText';
import { RealmCategory } from '@hub/types/RealmCategory';
import * as RE from '@hub/types/Result';
import { RichTextDocument } from '@hub/types/RichTextDocument';
import { RoadmapItemStatus } from '@hub/types/RoadmapItemStatus';

import { BasicInfo } from './BasicInfo';
import { FAQ } from './FAQ';
import { Gallery } from './Gallery';
import * as gql from './gql';
import { Overview } from './Overview';
import { Roadmap } from './Roadmap';
import { Tab } from './Tab';
import { Team } from './Team';

function removeClippedAnswer<
  O extends { clippedAnswer?: any; [key: string]: any }
>(item: O): Omit<O, 'clippedAnswer'> {
  if ('clippedAnswer' in item) {
    // eslint-disable-next-line
    const { clippedAnswer, ...rest } = item;
    return rest;
  }

  return item;
}

function removeTypename<O extends { __typename?: string; [key: string]: any }>(
  item: O,
): Omit<O, '__typename'> {
  if ('__typename' in item) {
    // eslint-disable-next-line
    const { __typename, ...rest } = item;
    return rest;
  }

  return item;
}

function removeTwitterFollowerCount<
  O extends { twitterFollowerCount?: any; [key: string]: any }
>(item: O): Omit<O, 'twitterFollowerCount'> {
  if ('twitterFollowerCount' in item) {
    // eslint-disable-next-line
    const { twitterFollowerCount, ...rest } = item;
    return rest;
  }

  return item;
}

interface Realm {
  bannerImageUrl: null | string;
  category: RealmCategory;
  discordUrl: null | string;
  displayName: string;
  githubUrl: null | string;
  heading: null | RichTextDocument;
  iconUrl: null | string;
  instagramUrl: null | string;
  shortDescription: null | string;
  symbol: null | string;
  twitterHandle: null | string;
  websiteUrl: null | string;
  about: {
    content: RichTextDocument;
    heading: null | string;
  }[];
  documentation: null | {
    title: null | string;
    url: string;
  };
  faq: {
    answer: RichTextDocument;
    question: string;
  }[];
  gallery: {
    caption: null | string;
    url: string;
    height: number;
    width: number;
  }[];
  resources: {
    content: null | RichTextDocument;
    title: string;
    url: string;
  }[];
  roadmap: {
    description: null | RichTextDocument;
    items: {
      date: null | number;
      resource: null | {
        content: null | RichTextDocument;
        title: string;
        url: string;
      };
      status: null | RoadmapItemStatus;
      title: string;
    }[];
  };
  team: {
    avatar: null | string;
    description: null | RichTextDocument;
    linkedIn: null | string;
    name: string;
    role: null | string;
    twitter: null | string;
  }[];
  token: null | {
    mint: PublicKey;
  };
}

async function enhanceData(data: Realm): Promise<Realm> {
  const newRealm = removeTypename({ ...data });

  newRealm.gallery = await Promise.all(
    newRealm.gallery.map(async (image) => {
      if (image.url.includes('youtube.com')) {
        return removeTypename({ ...image, height: 448, width: 800 });
      }

      let height = 0;
      let width = 0;

      try {
        const dimensions = await getDimensions(image.url);
        height = dimensions.height;
        width = dimensions.width;
      } catch (e) {
        console.error(e);
      }

      if (height > 800) {
        const ratio = width / height;
        height = 800;
        width = ratio * 800;
      }

      if (width > 800) {
        const ratio = height / width;
        width = 800;
        height = ratio * 800;
      }

      return removeTypename({ ...image, height, width });
    }),
  );

  newRealm.about = newRealm.about.map(removeTypename);
  newRealm.documentation = newRealm.documentation
    ? removeTypename(newRealm.documentation)
    : newRealm.documentation;
  newRealm.faq = newRealm.faq.map(removeTypename).map(removeClippedAnswer);
  newRealm.resources = newRealm.resources.map(removeTypename);
  newRealm.roadmap = { ...removeTypename(newRealm.roadmap) };
  newRealm.roadmap.items = newRealm.roadmap.items
    .map(removeTypename)
    .map((item) => {
      return {
        ...item,
        resource: item.resource ? removeTypename(item.resource) : null,
      };
    });
  newRealm.team = newRealm.team
    .map(removeTypename)
    .map(removeTwitterFollowerCount);
  return newRealm;
}

interface Props {
  className?: string;
  newRealmMode?: boolean;
  data: Realm & {
    name: string;
    publicKey: PublicKey;
    urlId: string;
  };
  saveError?: string;
  onSave?(updates: Realm): Promise<boolean>;
}

export function EditForms(props: Props) {
  const router = useRouter();
  const [about, setAbout] = useState(props.data.about);
  const [bannerImageUrl, setBannerImageUrl] = useState(
    props.data.bannerImageUrl,
  );
  const [category, setCategory] = useState(props.data.category);
  const [discordUrl, setDiscordUrl] = useState(props.data.discordUrl);
  const [displayName, setDisplayName] = useState(props.data.displayName);
  const [documentation, setDocumentation] = useState(props.data.documentation);
  const [faq, setFaq] = useState(props.data.faq);
  const [gallery, setGallery] = useState(props.data.gallery);
  const [githubUrl, setGithubUrl] = useState(props.data.githubUrl);
  const [heading, setHeading] = useState(props.data.heading);
  const [iconUrl, setIconUrl] = useState(props.data.iconUrl);
  const [instagramUrl, setInstagramUrl] = useState(props.data.instagramUrl);
  const [resources, setResources] = useState(props.data.resources);
  const [roadmap, setRoadmap] = useState(props.data.roadmap);
  const [shortDescription, setShortDescription] = useState(
    props.data.shortDescription,
  );
  const [symbol, setSymbol] = useState(props.data.symbol);
  const [team, setTeam] = useState(props.data.team);
  const [token, setToken] = useState(props.data.token);
  const [tokenIsValid, setTokenIsValid] = useState(true);
  const [tokenStr, setTokenStr] = useState(
    props.data.token?.mint.toBase58() || null,
  );
  const [twitterHandle, setTwitterHandle] = useState(props.data.twitterHandle);
  const [websiteUrl, setWebsiteUrl] = useState(props.data.websiteUrl);

  const [symbolValidResp] = useQuery(gql.checkSymbolResp, {
    query: gql.checkSymbol,
    variables: {
      symbol,
      realm: props.data.publicKey.toBase58(),
    },
    pause: !symbol,
  });

  const [tab, setTab] = useState('Basics');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0 });
    }
  }, [tab]);

  const headingText = heading ? toPlainText(heading) : '';
  const headingIsTooLong = headingText.length > 130;

  const hasErrors =
    (symbol &&
      RE.isOk(symbolValidResp) &&
      symbolValidResp.data.canAssignSymbolToRealm === false) ||
    !tokenIsValid ||
    headingIsTooLong;

  const updatedRealm = {
    about,
    bannerImageUrl,
    category,
    discordUrl,
    displayName,
    documentation,
    faq,
    gallery,
    githubUrl,
    heading,
    iconUrl,
    instagramUrl,
    resources,
    roadmap,
    shortDescription,
    symbol,
    team,
    token,
    twitterHandle,
    websiteUrl,
  };

  return (
    <Tabs.Root value={tab} onValueChange={setTab}>
      <div className={props.className}>
        <div className="pt-4 pb-2 bg-neutral-100 sticky top-14 z-10">
          <Tabs.List className="grid grid-cols-6 gap-x-0.5 rounded overflow-hidden">
            <Tab icon={<OrderDetailsIcon />} text="Basics" />
            <Tab icon={<DicomOverlayIcon />} text="Overview" />
            <Tab icon={<ImageIcon />} text="Gallery" />
            <Tab icon={<UserMultipleIcon />} text="Team" />
            <Tab icon={<LocationStarIcon />} text="Roadmap" />
            <Tab icon={<FaqIcon />} text="FAQs" />
          </Tabs.List>
        </div>
        <div className="mt-16 pb-48">
          <Tabs.Content value="Basics">
            <BasicInfo
              bannerImageUrl={bannerImageUrl}
              category={category}
              discordUrl={discordUrl}
              displayName={displayName}
              documentation={documentation}
              githubUrl={githubUrl}
              iconUrl={iconUrl}
              instagramUrl={instagramUrl}
              name={props.data.name}
              publicKey={props.data.publicKey}
              shortDescription={shortDescription}
              symbol={symbol}
              symbolIsValid={
                symbol
                  ? RE.isOk(symbolValidResp)
                    ? symbolValidResp.data.canAssignSymbolToRealm
                    : undefined
                  : true
              }
              tokenIsValid={tokenIsValid}
              tokenMintStr={tokenStr}
              twitterHandle={twitterHandle}
              websiteUrl={websiteUrl}
              onBannerImageUrlChange={setBannerImageUrl}
              onCategoryChange={setCategory}
              onDiscordUrlChange={setDiscordUrl}
              onDisplayNameChange={setDisplayName}
              onDocumentationChange={setDocumentation}
              onGithubUrlChange={setGithubUrl}
              onIconUrlChange={setIconUrl}
              onInstagramUrlChange={setInstagramUrl}
              onShortDescriptionChange={setShortDescription}
              onSymbolChange={setSymbol}
              onTwitterHandleChange={setTwitterHandle}
              onWebsiteUrlChange={setWebsiteUrl}
              onTokenMintStrChange={(tokenMintStr) => {
                setTokenStr(tokenMintStr);

                if (tokenMintStr) {
                  try {
                    const mint = new PublicKey(tokenMintStr);
                    setToken({ mint });
                    setTokenIsValid(true);
                  } catch (e) {
                    setToken(null);
                    setTokenIsValid(false);
                  }
                } else {
                  setToken(null);
                  setTokenIsValid(true);
                }
              }}
            />
          </Tabs.Content>
          <Tabs.Content value="Overview">
            <Overview
              about={about}
              heading={heading}
              resources={resources}
              onAboutChange={setAbout}
              onHeadingChange={setHeading}
              onResourcesChange={setResources}
            />
          </Tabs.Content>
          <Tabs.Content value="Gallery">
            <Gallery gallery={gallery} onGalleryChange={setGallery} />
          </Tabs.Content>
          <Tabs.Content value="Team">
            <Team team={team} onTeamChange={setTeam} />
          </Tabs.Content>
          <Tabs.Content value="Roadmap">
            <Roadmap roadmap={roadmap} onRoadmapChange={setRoadmap} />
          </Tabs.Content>
          <Tabs.Content value="FAQs">
            <FAQ faq={faq} onFaqChange={setFaq} />
          </Tabs.Content>
        </div>
      </div>
      <div
        className={cx(
          'bg-white',
          'bottom-0',
          'drop-shadow-2xl',
          'fixed',
          'flex',
          'items-center',
          'justify-center',
          'left-0',
          'right-0',
          'h-20',
          'z-10',
          'sm:h-28',
        )}
      >
        <div className="px-4 max-w-3xl w-full flex items-center justify-between">
          <div>
            {(hasErrors || props.saveError) && (
              <div className="text-sm text-rose-500">
                <span className="hidden sm:inline">
                  {props.saveError || 'Please fix errors before saving'}
                </span>
                <span className="sm:hidden">
                  {props.saveError ? 'Could not save' : 'Please fix errors'}
                </span>
              </div>
            )}
          </div>
          {props.newRealmMode ? (
            tab === 'FAQs' ? (
              <Primary
                className="flex-shrink-0"
                disabled={hasErrors}
                pending={submitting}
                onClick={async () => {
                  let success = true;

                  if (props.onSave) {
                    setSubmitting(true);
                    const updates = await enhanceData(updatedRealm);
                    success = await props.onSave(updates);
                    setSubmitting(false);
                  }

                  if (success) {
                    router.push(`/realm/${props.data.urlId}/hub`);
                  }
                }}
              >
                Finish <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Primary>
            ) : (
              <Secondary
                className="flex-shrink-0"
                disabled={hasErrors}
                pending={submitting}
                onClick={async () => {
                  let success = true;

                  if (props.onSave) {
                    setSubmitting(true);
                    const updates = await enhanceData(updatedRealm);
                    success = await props.onSave(updates);
                    setSubmitting(false);
                  }

                  if (success) {
                    if (tab === 'Basics') {
                      setTab('Overview');
                    } else if (tab === 'Overview') {
                      setTab('Gallery');
                    } else if (tab === 'Gallery') {
                      setTab('Team');
                    } else if (tab === 'Team') {
                      setTab('Roadmap');
                    } else if (tab === 'Roadmap') {
                      setTab('FAQs');
                    } else if (tab === 'FAQs') {
                      router.push(`/realm/${props.data.urlId}/hub`);
                    }
                  }
                }}
              >
                {tab === 'FAQs' ? 'Done' : 'Save & Continue'}{' '}
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Secondary>
            )
          ) : (
            <div className="flex items-center space-x-8">
              <Link passHref href={`/realm/${props.data.urlId}/hub`}>
                <a className="text-sky-500 text-sm m-0">Back to Hub</a>
              </Link>
              <Secondary
                className="flex-shrink-0"
                disabled={hasErrors}
                pending={submitting}
                onClick={async () => {
                  if (props.onSave) {
                    setSubmitting(true);
                    const updates = await enhanceData(updatedRealm);
                    await props.onSave(updates);
                    setSubmitting(false);
                  }
                }}
              >
                Save
              </Secondary>
            </div>
          )}
        </div>
      </div>
    </Tabs.Root>
  );
}
