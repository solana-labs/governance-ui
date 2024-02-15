import {PublicKey} from "@solana/web3.js";

export const reduceAsync = async <TElem, TOut = TElem>(
    arr: TElem[],
    reducer: (
        acc: Awaited<TOut>,
        item: TElem
    ) => Promise<TOut>,
    initialValue: TOut
): Promise<TOut> =>
    arr.reduce(async (acc, item) => reducer(await acc, item), Promise.resolve(initialValue))

type PublicKeyMap = {
    [key: string]: PublicKey | undefined;
}

/**
 * Used to cache react-query responses.
 * Convert to strings to avoid object equality issues.
 * @param args
 */
export const queryKeys = (args: PublicKeyMap) =>
    Object.values(args).map((value) => (value ?? "").toString())