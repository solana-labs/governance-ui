import WarningIcon from '@carbon/icons-react/lib/Warning';
import * as Dialog from '@radix-ui/react-dialog';
import { pipe } from 'fp-ts/lib/function';

import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import * as gql from './gql';
import { Stats } from './Stats';

interface Props {
  className?: string;
}

export function GlobalStats(props: Props) {
  const [result] = useQuery(gql.getPermsResp, {
    query: gql.getPerms,
  });

  return pipe(
    result,
    RE.match(
      () => <div />,
      () => <div />,
      ({ me }) =>
        me?.amSiteAdmin === true ? (
          <Stats className={props.className} />
        ) : (
          <Dialog.Root open>
            <Dialog.Overlay
              className={cx(
                'backdrop-blur-lg',
                'bg-white/30',
                'bottom-0',
                'fixed',
                'flex',
                'items-center',
                'justify-center',
                'left-0',
                'p-8',
                'right-0',
                'top-0',
                'z-20',
              )}
            >
              <div className="flex flex-col space-y-3 items-center">
                <div className="flex items-center space-x-2">
                  <WarningIcon className="h-7 w-7 fill-rose-500" />
                  <div className="font-bold text-2xl text-neutral-900">
                    Forbidden
                  </div>
                </div>
                <div className="text-neutral-700 text-center">
                  You are not authorized to view this page
                </div>
              </div>
            </Dialog.Overlay>
          </Dialog.Root>
        ),
    ),
  );
}
