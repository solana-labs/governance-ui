import FlagFilledIcon from '@carbon/icons-react/lib/FlagFilled';
import TwitterIcon from '@carbon/icons-react/lib/LogoTwitter';

import { RichTextDocumentDisplay } from '@hub/components/RichTextDocumentDisplay';
import cx from '@hub/lib/cx';
import { formatNumber } from '@hub/lib/formatNumber';
import { isEmpty } from '@hub/lib/richText';
import { RichTextDocument } from '@hub/types/RichTextDocument';

interface Props {
  className?: string;
  teamMembers: {
    avatar?: null | string;
    description?: null | RichTextDocument;
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
        'items-center',
        'w-full',
        props.className,
      )}
    >
      <header className="flex items-center text-neutral-900">
        <FlagFilledIcon className="fill-neutral-300 h-6 mr-5 w-6" />
        <div className="text-4xl font-semibold">The Team</div>
      </header>
      <div className="mt-12 w-full">
        {props.teamMembers.map((teamMember, i) => (
          <div
            className={cx(
              'border-b',
              'border-neutral-300',
              'gap-x-12',
              'grid-cols-[160px,1fr]',
              'grid',
              'pb-10',
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
                  : undefined,
              }}
            >
              {!teamMember.avatar && (
                <div className="text-7xl text-white">
                  {teamMember.name[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-h-[160px] flex items-center">
              <div>
                <div className="text-2xl text-neutral-900 font-medium">
                  {teamMember.name}
                </div>
                {teamMember.role && (
                  <div className="text-neutral-500 mt-0.5">
                    {teamMember.role}
                  </div>
                )}

                {teamMember.twitter && (
                  <div className="flex items-center mt-0.5">
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
                    className="text-neutral-700 leading-7 mt-1"
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
