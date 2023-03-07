import { AnchorProvider, Program } from '@project-serum/anchor'
import { keypairIdentity, Metaplex } from '@metaplex-foundation/js'
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { SubDaoWithMeta } from '../sdk/types'
import { PROGRAM_ID, init, daoKey } from '@helium/helium-sub-daos-sdk'
import { HNT_MINT } from '@helium/spl-utils'

export const getSubDaos = async (
  connection: Connection,
  provider: AnchorProvider,
  programId: PublicKey = PROGRAM_ID
): Promise<SubDaoWithMeta[]> => {
  try {
    const subDaos: SubDaoWithMeta[] = []
    const idl = await Program.fetchIdl(programId, provider)
    const hsdProgram = await init(provider as any, programId, idl)

    const keypair = Keypair.generate()
    const metaplex = new Metaplex(connection).use(keypairIdentity(keypair))
    const dao = await daoKey(HNT_MINT, programId)[0]
    const subdaos = await hsdProgram.account.subDaoV0.all([
      {
        memcmp: {
          offset: 8,
          bytes: bs58.encode(dao.toBuffer()),
        },
      },
    ])

    const dntMetadatas = await Promise.all(
      subdaos.map(async (subDao) =>
        metaplex.nfts().findByMint({
          mintAddress: subDao.account.dntMint,
        })
      )
    )

    subDaos.push(
      ...subdaos.map((subDao, idx) => {
        return {
          ...subDao.account,
          pubkey: subDao.publicKey,
          dntMetadata: dntMetadatas[idx],
        } as SubDaoWithMeta
      })
    )

    return subDaos
  } catch (error) {
    console.error(error)
    throw error
  }
}
