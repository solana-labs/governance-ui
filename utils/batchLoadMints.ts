import { MintInfo, MintLayout, u64 } from '@solana/spl-token'
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'

/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} Array to split
 * @param chunkSize {Integer} Size of every group
 */
const chunkArray = <T>(myArray: T[], chunkSize: number) => {
  let index = 0
  const arrayLength = myArray.length
  const tempArray: T[][] = []

  for (index = 0; index < arrayLength; index += chunkSize) {
    const myChunk = myArray.slice(index, index + chunkSize)
    tempArray.push(myChunk)
  }

  return tempArray
}

const batchLoadMints = async (connection: Connection, mints: PublicKey[]) => {
  const groupOfMints: PublicKey[][] = chunkArray(mints, 100)
  const getMultipleAccountsInfoPromises: Promise<
    (AccountInfo<Buffer> | null)[]
  >[] = groupOfMints.map((mints) => {
    return connection.getMultipleAccountsInfo(mints)
  })
  const results = await Promise.all(getMultipleAccountsInfoPromises)
  const infos: (AccountInfo<Buffer> | null)[] = results.flat()
  const mintInfos: Record<string, MintInfo> = {}
  infos.forEach((info, index) => {
    if (!info) return
    const mintInfo = MintLayout.decode(info.data)
    if (mintInfo.mintAuthorityOption === 0) {
      mintInfo.mintAuthority = null
    } else {
      mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority)
    }

    mintInfo.supply = u64.fromBuffer(mintInfo.supply)
    mintInfo.isInitialized = mintInfo.isInitialized !== 0

    if (mintInfo.freezeAuthorityOption === 0) {
      mintInfo.freezeAuthority = null
    } else {
      mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority)
    }
    mintInfos[mints[index].toString()] = mintInfo
  })
  return mintInfos
}

export default batchLoadMints
