import FlagFilledIcon from '@carbon/icons-react/lib/FlagFilled';
import LinkedInIcon from '@carbon/icons-react/lib/LogoLinkedin';
import TwitterIcon from '@carbon/icons-react/lib/LogoTwitter';

import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { isEmpty } from '@hub/lib/richText';
import { RichTextDocument } from '@hub/types/RichTextDocument';

import defaultimage from './avatar-default.jpg';

interface Props {
  className?: string;
  teamMembers: {
    avatar?: null | string;
    description?: null | RichTextDocument;
    linkedIn?: null | string;
    name: string;
    role?: null | string;
    twitter?: null | string;
    twitterFollowerCount: number;
  }[];
}

export function Team(props: Props) {
  return (
    <article
      className={cx(
        'flex',
        'flex-col',
        'w-full',
        'items-start',
        'md:items-center',
        props.className,
      )}
    >
      <header className="flex items-center text-neutral-900">
        <FlagFilledIcon className="fill-neutral-300 mr-5 h-5 w-5 md:h-6 md:w-6" />
        <div className="font-semibold text-2xl md:text-4xl">The Team</div>
      </header>
      <div className="mt-12 w-full space-y-10">
        {props.teamMembers.map((teamMember, i) => (
          <div
            className={cx(
              'border-b',
              'border-neutral-300',
              'gap-x-12',
              'pb-10',
              'md:grid',
              'md:grid-cols-[160px,1fr]',
            )}
            key={i}
          >
            <div
              className={cx(
                'bg-center',
                'bg-cover',
                'flex',
                'h-40',
                'items-center',
                'justify-center',
                'rounded-full',
                'w-40',
                !teamMember.avatar && 'bg-neutral-300',
              )}
              style={{
                backgroundImage: teamMember.avatar
                  ? `url(${teamMember.avatar})`
                  : `url(${defaultimage.src})`,
              }}
            />
            <div className="mt-4 md:mt-0 md:min-h-[160px] flex items-center">
              <div>
                <div className="text-neutral-900 font-medium text-xl md:text-2xl">
                  {teamMember.name}
                </div>
                {teamMember.role && (
                  <div className="text-neutral-500 mt-0.5 text-sm md:text-base">
                    {teamMember.role}
                  </div>
                )}
                {(teamMember.twitter || teamMember.linkedIn) && (
                  <div className="flex items-center mt-0.5">
                    {teamMember.linkedIn && (
                      <a
                        href={teamMember.linkedIn}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LinkedInIcon className="h-6 w-6 fill-sky-600" />
                      </a>
                    )}
                    {teamMember.twitter && (
                      <a
                        className="flex items-center hover:underline"
                        href={`https://www.twitter.com/${teamMember.twitter}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <TwitterIcon className="h-6 fill-blue-400 mr-0.5 w-6" />
                        <div className="text-sm text-neutral-900">
                          {teamMember.twitter}
                        </div>
                      </a>
                    )}
                    {teamMember.twitterFollowerCount > 0 && (
                      <div className="text-sm text-neutral-500 ml-1.5">
                        {formatNumber(
                          teamMember.twitterFollowerCount,
                          undefined,
                          { maximumFractionDigits: 0 },
                        )}{' '}
                        followers
                      </div>
                    )}
                  </div>
                )}
                {teamMember.description && !isEmpty(teamMember.description) && (
                  <RichTextDocumentDisplay
                    className="text-neutral-700 leading-7 mt-1 text-sm md:text-base"
                    document={teamMember.description}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
