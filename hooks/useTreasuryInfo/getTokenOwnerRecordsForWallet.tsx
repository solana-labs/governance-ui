import { getCertifiedRealmInfos } from '@models/registry/api'
import { AssetType, TokenOwnerRecordAsset } from '@models/treasury/Asset'
import {
  getRealm,
  getTokenOwnerRecord,
  getTokenOwnerRecordAddress,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import { tryGetMint } from '@utils/tokens'

const getTokenOwnerRecordsForWallet = async (
  connection: ConnectionContext,
  walletAddress?: PublicKey | null
): Promise<TokenOwnerRecordAsset[]> => {
  if (!walletAddress) return []

  const realmInfos = getCertifiedRealmInfos(connection)

  let tokenOwnerRecords = await Promise.all(
    realmInfos.map(async (r) => {
      try {
        const realmData = await getRealm(connection.current, r.realmId)
        const recordAddress = await getTokenOwnerRecordAddress(
          r.programId,
          realmData.pubkey,
          realmData.account.communityMint,
          walletAddress
        )
        const recordData = await getTokenOwnerRecord(
          connection.current,
          recordAddress
        )
        const communityMint = await tryGetMint(
          connection.current,
          realmData.account.communityMint
        )
        return {
          type: AssetType.TokenOwnerRecordAsset,
          id: recordAddress.toBase58(),
          address: recordAddress,
          owner: walletAddress,
          programId: r.programId.toBase58(),
          realmId: realmData.pubkey.toBase58(),
          displayName: r.displayName ? r.displayName : 'Unnamed DAO',
          realmSymbol: r.symbol,
          realmImage: r.ogImage ? r.ogImage : undefined,
          communityMint: communityMint,
          realmAccount: realmData,
          tokenOwnerRecordAccount: recordData,
        }
      } catch (e) {
        return null
      }
    })
  )
  tokenOwnerRecords = tokenOwnerRecords.filter((r) => r !== null)

  return tokenOwnerRecords as TokenOwnerRecordAsset[]
}

export default getTokenOwnerRecordsForWallet
