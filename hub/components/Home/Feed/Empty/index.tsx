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
          Hello, and welcome to Realms!
        </h1>
        <div className="text-sm text-neutral-700">
          Get the conversation started with a welcome post
        </div>
      </div>
    </article>
  );
}
