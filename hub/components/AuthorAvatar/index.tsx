import FaceSatisfiedIcon from '@carbon/icons-react/lib/FaceSatisfied';
import type { PublicKey } from '@solana/web3.js';

import { FeedItemAuthor } from '../Home/Feed/gql';
import cx from '@hub/lib/cx';

const POSSIBLE_COLORS = [
  'bg-red-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-yellow-400',
  'bg-lime-400',
  'bg-green-400',
  'bg-emerald-400',
  'bg-cyan-400',
  'bg-sky-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-violet-400',
  'bg-purple-400',
  'bg-fuchsia-400',
  'bg-pink-400',
  'bg-rose-400',
];

const computedColors = new Map<string, string>();

function pickDefaultBg(publicKey: PublicKey) {
  const pk = publicKey.toBase58();

  if (computedColors.has(pk)) {
    return computedColors.get(pk);
  }

  const num = pk.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = num % POSSIBLE_COLORS.length;

  const color = POSSIBLE_COLORS[index];

  if (typeof window !== 'undefined') {
    computedColors.set(pk, color);
  }

  return color;
}

interface Props {
  className?: string;
  author?: FeedItemAuthor | null;
}

export function AuthorAvatar(props: Props) {
  if (props.author?.twitterInfo?.avatarUrl) {
    return (
      <img
        className={cx(
          'rounded-full',
          'border',
          'border-neutral-400',
          props.className,
        )}
        src={props.author.twitterInfo.avatarUrl}
      />
    );
  } else if (props.author) {
    const bgColor = pickDefaultBg(props.author.publicKey);
    const text = props.author.publicKey.toBase58().slice(0, 2);

    return (
      <div
        className={cx(
          bgColor,
          'flex',
          'items-center',
          'justify-center',
          'rounded-full',
          'text-white',
          'tracking-tighter',
          props.className,
        )}
      >
        {text}
      </div>
    );
  } else {
    return (
      <FaceSatisfiedIcon className={cx('fill-neutral-400', props.className)} />
    );
  }
}
