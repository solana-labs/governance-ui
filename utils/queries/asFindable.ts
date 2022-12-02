const asFindable = <F extends (...args: any[]) => any>(f: F) => async (
  ...p: Parameters<F>
) => {
  try {
    return {
      found: true,
      result: await f(...p),
    } as const
  } catch (e) {
    if ((e.message as string).includes('not found')) {
      return { found: false, result: undefined } as const
    }

    return Promise.reject(e)
  }
}

export default asFindable
