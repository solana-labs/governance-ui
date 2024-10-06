import { Connection, PublicKey } from '@solana/web3.js'

export const shortenAddress = (address: string, chars = 5): string =>
  `${address.substring(0, chars)}...${address.substring(
    address.length - chars
  )}`

export const genShortestUnusedSeed = async (
  connection: Connection,
  basePubkey: PublicKey,
  programId: PublicKey
) => {
  const MAX_SEED_LEN = 32
  const ASCII_MAX = 127
  let len = 1
  // find the smallest available seed to optimize for small tx size
  while (len <= MAX_SEED_LEN) {
    const codes = new Array(len).fill(0)
    while (!codes.every((c) => c === ASCII_MAX)) {
      // check current seed unused
      const seed = String.fromCharCode(...codes)
      // eslint-disable-next-line no-await-in-loop
      const derived = await PublicKey.createWithSeed(
        basePubkey,
        seed,
        programId
      )
      // eslint-disable-next-line no-await-in-loop
      const balance = await connection.getBalance(derived)
      if (balance === 0) {
        return {
          base: basePubkey,
          derived,
          seed,
        }
      }
      // current seed used, increment code
      codes[codes.length - 1]++
      for (let i = codes.length - 1; i > 0; i--) {
        const prevI = i - 1
        if (codes[i] > ASCII_MAX) {
          codes[i] = 0
          codes[prevI]++
        }
      }
    }
    // all seeds of current len are used
    len++
  }
  throw new Error('No unused seeds found')
}
