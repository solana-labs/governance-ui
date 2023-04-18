import { pipe } from 'fp-ts/function';
import { useRouter } from 'next/router';

import { useJWT } from '@hub/hooks/useJWT';
import { useQuery } from '@hub/hooks/useQuery';
import { useWallet } from '@hub/hooks/useWallet';
import cx from '@hub/lib/cx';
import * as RE from '@hub/types/Result';

import { Connect } from './Connect';
import { Connected } from './Connected';
import { DialectNotifications } from './DialectNotifications';
import * as gql from './gql';
import { Loading } from './Loading';
import { UserDropdown } from './UserDropdown';

interface Props {
  className?: string;
  compressed?: boolean;
}

export function User(props: Props) {
  const router = useRouter();
  const isHybridRealmsHubPage =
    router.pathname.startsWith('/realm/[id]/governance') ||
    router.pathname.startsWith('/realm/[id]/config');

  const [result, refetch] = useQuery(gql.getUserResp, { query: gql.getUser });
  const { publicKey, softConnect } = useWallet();
  const [jwt] = useJWT();

  if (!jwt && publicKey && softConnect) {
    return (
      <Connected
        className={props.className}
        compressed={props.compressed}
        userPublicKey={publicKey}
      />
    );
  }

  return pipe(
    result,
    RE.match(
      () => (
        <Connect
          className={props.className}
          compressed={props.compressed}
          doNotUseJwts={isHybridRealmsHubPage}
          onConnected={() => refetch({})}
        />
      ),
      () => (
        <Loading compressed={props.compressed} className={props.className} />
      ),
      ({ me }) => (
        <div className={cx(props.className, 'flex', 'items-center')}>
          <DialectNotifications className="mx-2" />
          <UserDropdown user={me} compressed={props.compressed} />
        </div>
      ),
    ),
  );
}
