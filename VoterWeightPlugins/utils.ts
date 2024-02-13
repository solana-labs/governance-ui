export const reduceAsync = async <TElem, TOut = TElem>(
    arr: TElem[],
    reducer: (
        acc: Awaited<TOut>,
        item: TElem
    ) => Promise<TOut>,
    initialValue: TOut
): Promise<TOut> =>
    arr.reduce(async (acc, item) => reducer(await acc, item), Promise.resolve(initialValue))