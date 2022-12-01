import { WelcomeHand } from '@hub/components/branding/WelcomeHand';
import cx from '@hub/lib/cx';

interface Props {
  className?: string;
}

export function Empty(props: Props) {
  return (
    <article
      className={cx(props.className, 'flex', 'items-center', 'justify-center')}
    >
      <div className="flex flex-col items-center justify-center">
        <WelcomeHand className="h-[122px] w-[120px] mb-6" />
        <h1 className="font-bold mt-0 mb-2 text-neutral-900">
          Your feed is empty!
        </h1>
        <div className="text-sm text-neutral-700">
          Join more Hubs to populate your feed.
        </div>
      </div>
    </article>
  );
}
