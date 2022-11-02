import { pipe } from 'fp-ts/function';

import { useQuery } from '@hub/hooks/useQuery';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import { Connect } from './Connect';
import { DialectNotifications } from './DialectNotifications';
import * as gql from './gql';
import { Loading } from './Loading';
import { UserDropdown } from './UserDropdown';

interface Props {
  className?: string;
  compressed?: boolean;
}

export function User(props: Props) {
  const [result, refetch] = useQuery(gql.getUserResp, { query: gql.getUser });

  return pipe(
    result,
    RE.match(
      () => (
        <Connect
          className={props.className}
          compressed={props.compressed}
          onConnected={() => refetch({})}
        />
      ),
      () => (
        <Loading compressed={props.compressed} className={props.className} />
      ),
      ({ me }) => (
        <div className={cx(props.className, 'flex', 'items-center')}>
          <DialectNotifications />
          <UserDropdown user={me} compressed={props.compressed} />
        </div>
      ),
    ),
  );
}
