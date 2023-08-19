import { Connection, PublicKey } from '@solana/web3.js'
import { fetchRealmByPubkey } from '../realm'
import { getRegistrarPDA } from '@utils/plugin/accounts'
import { Program } from '@coral-xyz/anchor'
import { IDL, NftVoter } from 'idls/nft_voter'
import asFindable from '@utils/queries/asFindable'
import queryClient from '../queryClient'

const nftMintRegistrarQueryFn = async (
  connection: Connection,
  programId: PublicKey, // TODO just get this from realm config
  realmPk: PublicKey
) => {
  const realm = (await fetchRealmByPubkey(connection, realmPk)).result
  if (!realm) throw new Error()

  const { registrar: registrarPk } = await getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    programId
  )

  // use anchor to fetch registrar :-)
  const program = new Program<NftVoter>(IDL, programId, { connection })

  return asFindable(() => program.account.registrar.fetch(registrarPk))()
}

export const fetchNftRegistrar = (
  connection: Connection,
  programId: PublicKey, // TODO just get this from realm config
  realmPk: PublicKey
) =>
  queryClient.fetchQuery({
    queryKey: [
      connection.rpcEndpoint,
      'Nft Plugin Registrar',
      realmPk.toString(),
    ],
    queryFn: () => nftMintRegistrarQueryFn(connection, programId, realmPk),
  })
