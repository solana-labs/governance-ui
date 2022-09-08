import { pipe } from 'fp-ts/function';
import * as IT from 'io-ts';
import { gql } from 'urql';

import { useQuery } from '@hub/hooks/useQuery';
import { PublicKey } from '@hub/types/decoders/PublicKey';
import * as RE from '@hub/types/Result';

import { Connect } from './Connect';
import { Loading } from './Loading';
import { User } from './User';

const query = gql`
  query {
    me {
      publicKey
    }
  }
`;

const data = IT.type({
  me: IT.type({
    publicKey: PublicKey,
  }),
});

interface Props {
  className?: string;
}

export function UserDropdown(props: Props) {
  const [result, refetch] = useQuery(data, { query });

  return pipe(
    result,
    RE.match(
      () => (
        <Connect className={props.className} onConnected={() => refetch({})} />
      ),
      () => <Loading className={props.className} />,
      ({ me }) => <User className={props.className} publicKey={me.publicKey} />,
    ),
  );
}
