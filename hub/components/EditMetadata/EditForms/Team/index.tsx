import UserMultipleIcon from '@carbon/icons-react/lib/UserMultiple';
import { produce } from 'immer';
import { useState } from 'react';

import { FieldDescription } from '../common/FieldDescription';
import { isEmpty } from '@hub/lib/richText';
import { RichTextDocument } from '@hub/types/RichTextDocument';

import { Member } from './Member';

function trimTeam(
  team: {
    __typename?: string;
    avatar: null | string;
    description: null | RichTextDocument;
    linkedIn: null | string;
    name: string;
    role: null | string;
    twitter: null | string;
  }[],
): {
  avatar: null | string;
  description: null | RichTextDocument;
  linkedIn: null | string;
  name: string;
  role: null | string;
  twitter: null | string;
}[] {
  return team
    .filter((t) => {
      return (
        !!t.name ||
        !!t.avatar ||
        (!!t.description && !isEmpty(t.description)) ||
        !!t.role ||
        !!t.twitter
      );
    })
    .map((t) => {
      const { __typename, ...rest } = t;
      return rest;
    });
}

interface Props {
  className?: string;
  team: {
    avatar: null | string;
    description: null | RichTextDocument;
    linkedIn: null | string;
    name: string;
    role: null | string;
    twitter: null | string;
  }[];
  onTeamChange?(
    team: {
      avatar: null | string;
      description: null | RichTextDocument;
      name: string;
      role: null | string;
      twitter: null | string;
    }[],
  ): void;
}

export function Team(props: Props) {
  const [keyCounter, setKeyCounter] = useState(0);

  const team = (props.team.length
    ? [...props.team]
    : [
        {
          avatar: null,
          description: null,
          linkedIn: null,
          name: '',
          role: null,
          twitter: null,
        },
      ]
  ).concat({
    avatar: null,
    description: null,
    linkedIn: null,
    name: '',
    role: null,
    twitter: null,
  });

  return (
    <section className={props.className}>
      <header className="flex items-center space-x-2">
        <UserMultipleIcon className="h-4 w-4 sm:h-6 sm:w-6 fill-sky-500" />
        <div className="text-xl sm:text-3xl font-medium text-neutral-900">
          Add your team
        </div>
      </header>
      <FieldDescription className="mt-2">
        A quality team will go a long way in attracting a community.
      </FieldDescription>
      <div className="mt-16 space-y-16">
        {team.map((item, i) => (
          <Member
            index={i}
            key={String(keyCounter) + i}
            member={item}
            onChange={(member) => {
              const newTeam = produce(team, (draft) => {
                draft[i] = member;
              });
              props.onTeamChange?.(trimTeam(newTeam));
            }}
            onDelete={() => {
              const newTeam = team.filter((t, index) => index !== i);
              props.onTeamChange?.(trimTeam(newTeam));
              setKeyCounter((key) => key + 1);
            }}
          />
        ))}
      </div>
    </section>
  );
}
