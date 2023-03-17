export enum Status {
  /**
   * The Result has completed, but an error has occured
   */
  Failed,
  /**
   * The Result has completed, and the data is available
   */
  Ok,
  /**
   * The Result is currently waiting to complete
   */
  Pending,
  /**
   * The Result is currently waiting to complete, but stale data is available
   */
  Stale,
}

/**
 * The Result has completed, but an error has occured
 */
export interface Failed<E extends Error> {
  _tag: Status.Failed;
  /**
   * The error that has occured
   */
  error: E;
}

export interface Ok<D> {
  _tag: Status.Ok;
  /**
   * The data that was fetched
   */
  data: D;
}

export interface Pending {
  _tag: Status.Pending;
}

export interface Stale<D> {
  _tag: Status.Stale;
  /**
   * The stale data that is being replaced
   */
  data: D;
}

/**
 * Data in various asynchronous states.
 */
export type Result<D, E extends Error = Error> =
  | Failed<E>
  | Ok<D>
  | Pending
  | Stale<D>;

/**
 * Creates a `Result` in the `Failed` state.
 */
export function failed<E extends Error = Error>(error: E): Failed<E> {
  return { _tag: Status.Failed, error };
}

/**
 * Creates a `Result` in the `Ok` state.
 */
export function ok<D>(data: D): Ok<D> {
  return { _tag: Status.Ok, data };
}

/**
 * Creates a `Result` in the `Pending` state.
 */
export function pending(): Pending {
  return { _tag: Status.Pending };
}

/**
 * Creates a `Result` in the `Stale` state.
 */
export function stale<D>(data: D): Stale<D> {
  return { _tag: Status.Stale, data };
}

/**
 * Map over the data of a `Result` that is in the Ok or Stale states
 */
export function map<D, R>(
  fn: (data: D) => R,
): <E extends Error = Error>(result: Result<D, E>) => Result<R, E> {
  return (result) => {
    if (result._tag === Status.Ok || result._tag === Status.Stale) {
      return {
        _tag: result._tag,
        data: fn(result.data),
      };
    }

    return result;
  };
}

/**
 * Match over the Result
 */
export function match<D, R, E extends Error = Error>(
  onFailure: (error: E) => R,
  onPending: () => R,
  onOk: (data: D) => R,
  onStale: (data: D) => R,
): (result: Result<D, E>) => R;
export function match<D, R, E extends Error = Error>(
  onFailure: (error: E) => R,
  onPending: () => R,
  onOk: (data: D, isStale: boolean) => R,
): (result: Result<D, E>) => R;
export function match<D, R, E extends Error = Error>(
  onFailure: (error: E) => R,
  onPending: () => R,
  onOk: (data: D, isStale: boolean) => R,
  onStale?: (data: D) => R,
): (result: Result<D, E>) => R {
  return (result) => {
    if (isFailed(result)) {
      return onFailure(result.error);
    } else if (isPending(result)) {
      return onPending();
    } else if (isStale(result)) {
      if (onStale) {
        return onStale(result.data);
      } else {
        return onOk(result.data, true);
      }
    } else {
      return onOk(result.data, false);
    }
  };
}

/**
 * Determine if a `Result` is a `Failed`
 */
export function isFailed<D, E extends Error = Error>(
  result: Result<D, E>,
): result is Failed<E> {
  return result._tag === Status.Failed;
}

/**
 * Determine if a `Result` is an `Ok`
 */
export function isOk<D, E extends Error = Error>(
  result: Result<D, E>,
): result is Ok<D> {
  return result._tag === Status.Ok;
}

/**
 * Determine if a `Result` is a `Pending`
 */
export function isPending<D, E extends Error = Error>(
  result: Result<D, E>,
): result is Pending {
  return result._tag === Status.Pending;
}

/**
 * Determine if a `Result` is a `Stale`
 */
export function isStale<D, E extends Error = Error>(
  result: Result<D, E>,
): result is Stale<D> {
  return result._tag === Status.Stale;
}
