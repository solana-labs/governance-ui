import { left, match } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { DocumentNode } from 'graphql';
import { Type, TypeOf } from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import {
  useMutation as _useMutation,
  TypedDocumentNode,
  OperationContext,
  CombinedError,
  UseMutationState,
} from 'urql';

import * as RE from '@hub/types/Result';

function convertResponse<Variables = any, A = any, O = any, I = any>(
  type: Type<A, O, I>,
  resp: UseMutationState<I, Variables>,
): RE.Result<TypeOf<Type<A, O, I>>, CombinedError> {
  if (resp.fetching) {
    return RE.pending();
  } else if (resp.error) {
    return RE.failed(resp.error);
  } else if (!resp.data) {
    return RE.failed(
      new CombinedError({
        graphQLErrors: ['Could not fetch data'],
      }),
    );
  } else {
    return pipe(
      resp.data,
      type.decode,
      match(
        (error) =>
          RE.failed(
            new CombinedError({
              graphQLErrors: PathReporter.report(left(error)),
            }),
          ),
        (result) =>
          resp.stale
            ? (RE.stale(result) as RE.Result<A, CombinedError>)
            : (RE.ok(result) as RE.Result<A, CombinedError>),
      ),
    );
  }
}

export function useMutation<Variables = object, A = any, O = any, I = any>(
  responseType: Type<A, O, I>,
  query: DocumentNode | TypedDocumentNode<I, Variables> | string,
): [
  RE.Result<TypeOf<Type<A, O, I>>, CombinedError>,
  (
    variables?: Variables,
    context?: Partial<OperationContext>,
  ) => Promise<
    Exclude<
      RE.Result<TypeOf<Type<A, O, I>>, CombinedError>,
      { _tag: RE.Status.Pending }
    >
  >,
] {
  const [resp, run] = _useMutation<I, Variables>(query);
  const result = convertResponse<Variables, A, O, I>(responseType, resp);

  return [
    result,
    (variables?: Variables, context?: Partial<OperationContext>) =>
      run(variables || ({} as Variables), context).then((resp) => {
        if (resp.error) {
          return RE.failed(resp.error);
        } else if (!resp.data) {
          return RE.failed(
            new CombinedError({
              graphQLErrors: ['Could not fetch data'],
            }),
          );
        } else {
          return pipe(
            resp.data,
            responseType.decode,
            match(
              (error) =>
                RE.failed(
                  new CombinedError({
                    graphQLErrors: PathReporter.report(left(error)),
                  }),
                ),
              (result) =>
                resp.stale
                  ? (RE.stale(result) as Exclude<
                      RE.Result<TypeOf<Type<A, O, I>>, CombinedError>,
                      { _tag: RE.Status.Pending }
                    >)
                  : (RE.ok(result) as Exclude<
                      RE.Result<TypeOf<Type<A, O, I>>, CombinedError>,
                      { _tag: RE.Status.Pending }
                    >),
            ),
          );
        }
      }),
  ];
}
