const asFindable = <P extends any[], R>(f: (...p: P) => Promise<R>) => async (
  ...p: P
) => {
  try {
    const result = await f(...p)
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
