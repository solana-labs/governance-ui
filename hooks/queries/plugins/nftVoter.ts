import { Connection, PublicKey } from '@solana/web3.js'
import { fetchRealmByPubkey } from '../realm'
import { getRegistrarPDA } from '@utils/plugin/accounts'
import { Program } from '@coral-xyz/anchor'
import { IDL, NftVoter } from 'idls/nft_voter'
import asFindable from '@utils/queries/asFindable'
import queryClient from '../queryClient'
import { fetchRealmConfigQuery } from '../realmConfig'

const nftMintRegistrarQueryFn = async (
  connection: Connection,
  realmPk: PublicKey
) => {
  const realm = (await fetchRealmByPubkey(connection, realmPk)).result
  if (!realm) throw new Error()

  const config = await fetchRealmConfigQuery(connection, realmPk)
  const programId = config.result?.account.communityTokenConfig.voterWeightAddin
  if (programId === undefined)
    return { found: false, result: undefined } as const

  const { registrar: registrarPk } = await getRegistrarPDA(
    realm.pubkey,
    realm.account.communityMint,
    programId
  )

  // use anchor to fetch registrar :-)
  const program = new Program<NftVoter>(IDL, programId, { connection })

  return asFindable(() => program.account.registrar.fetch(registrarPk))()
}

export const fetchNftRegistrar = (connection: Connection, realmPk: PublicKey) =>
  queryClient.fetchQuery({
    queryKey: [
      connection.rpcEndpoint,
      'Nft Plugin Registrar',
      realmPk.toString(),
    ],
    queryFn: () => nftMintRegistrarQueryFn(connection, realmPk),
  })
