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
  status: Status.Failed
  /**
   * The error that has occured
   */
  error: E
}

export interface Ok<D> {
  status: Status.Ok
  /**
   * The data that was fetched
   */
  data: D
}

export interface Pending {
  status: Status.Pending
}

export interface Stale<D> {
  status: Status.Stale
  /**
   * The stale data that is being replaced
   */
  data: D
}

/**
 * Data in various asynchronous states.
 */
export type Result<D, E extends Error = Error> =
  | Failed<E>
  | Ok<D>
  | Pending
  | Stale<D>

export function map<D, R, E extends Error = Error>(
  result: Result<D, E>,
  fn: (data: D) => R
): Result<R, E> {
  if (result.status === Status.Ok || result.status === Status.Stale) {
    return {
      status: result.status,
      data: fn(result.data),
    }
  }

  return result
}
