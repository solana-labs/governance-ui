import { left, match } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { Type, TypeOf } from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import {
  useQuery as _useQuery,
  UseQueryArgs,
  OperationContext,
  CombinedError,
} from 'urql';

import * as RE from '@hub/types/Result';

export function useQuery<Variables = any, A = any, O = any, I = any>(
  responseType: Type<A, O, I>,
  args: UseQueryArgs<Variables, TypeOf<Type<A, O, I>>>,
): [
  RE.Result<TypeOf<Type<A, O, I>>, CombinedError>,
  (opts?: Partial<OperationContext> | undefined) => void,
] {
  const [resp, fn] = _useQuery<I, Variables>(args);

  if (resp.fetching) {
    return [RE.pending(), fn];
  } else if (resp.error) {
    return [RE.failed(resp.error), fn];
  } else if (!resp.data) {
    return [
      RE.failed(
        new CombinedError({
          graphQLErrors: ['Could not fetch data'],
        }),
      ),
      fn,
    ];
  } else {
    return pipe(
      resp.data,
      responseType.decode,
      match(
        (error) => [
          RE.failed(
            new CombinedError({
              graphQLErrors: PathReporter.report(left(error)),
            }),
          ),
          fn,
        ],
        (result) =>
          resp.stale
            ? [RE.stale(result) as RE.Result<A, CombinedError>, fn]
            : [RE.ok(result) as RE.Result<A, CombinedError>, fn],
      ),
    );
  }
}
