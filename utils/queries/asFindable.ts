/**
 * @param {any}  thisContext - second param if you want to call function that is part of
 * an object eg. connection.getAccountInfo
 * getAccountInfo will loss this binding so you need to
 * pass connection as context. Depends on lib/function implementation
 */
const asFindable = <P extends any[], R>(
  f: (...p: P) => Promise<R>,
  thisContext?: any
) => async (...p: P) => {
  try {
    const result = thisContext ? await f.call(thisContext, ...p) : await f(...p)
    if (result === null || result === undefined) {
      return {
        found: false,
        result: undefined,
      } as const
    }
    return {
      found: true,
      result,
    } as const
  } catch (e) {
    if ((e.message as string).includes('not found')) {
      return { found: false, result: undefined } as const
    }

    return Promise.reject(e)
  }
}

export default asFindable
