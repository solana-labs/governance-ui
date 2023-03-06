import { AnchorProvider, Program } from '@project-serum/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { SubDao, SubDaoWithMeta } from '../sdk/types'
import { PROGRAM_ID, init, subDaoKey } from '@helium/helium-sub-daos-sdk'
import { chunks } from '@utils/helpers'

export const getSubDaos = async (
  connection: Connection,
  provider: AnchorProvider,
  dao: PublicKey,
  programId: PublicKey = PROGRAM_ID
): Promise<SubDaoWithMeta[]> => {
  try {
    const subDaos: SubDaoWithMeta[] = []
    const idl = await Program.fetchIdl(programId, provider)
    const hsdProgram = await init(provider as any, programId, idl)

    /* const subDaoKeys = DNT_KEYS.map((dnt) => subDaoKey(dnt, programId)[0])
    const subDaoAccountInfos = (
      await Promise.all(
        chunks(subDaoKeys, 99).map((chunk) =>
          connection.getMultipleAccountsInfo(chunk)
        )
      )
    ).flat()

    subDaos.push(
      ...subDaoAccountInfos
        .map(
          (subDao) =>
            hsdProgram.coder.accounts.decode('SubDaoV0', subDao!.data) as SubDao
        )
        .map((subDao, idx) => {
          return {
            ...subDao,
            pubkey: subDaoKeys[idx],
          } as SubDaoWithMeta
        })
    ) */

    return subDaos
  } catch (error) {
    console.error(error)
    throw error
  }
}
