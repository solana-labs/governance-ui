import * as Separator from '@radix-ui/react-separator';

import { Post, Realm } from '../gql';
import cx from '@hub/lib/cx';

import { Announcements } from './Announcements';
import { Trending } from './Trending';

interface Props {
  className?: string;
  announcements: Post[];
  trending: Realm[];
}

export function Sidebar(props: Props) {
  return (
    <div className={cx('bg-white', 'rounded', props.className)}>
      <Trending className="px-3 pt-6 pb-14" realms={props.trending} />
      <Separator.Root className="w-full h-[2px] bg-neutral-100" />
      <Announcements className="px-3 pt-6 pb-10" posts={props.announcements} />
    </div>
  );
}
