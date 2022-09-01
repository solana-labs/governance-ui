import { getCertifiedRealmInfos } from '@models/registry/api'
import { AssetType, TokenOwnerAsset } from '@models/treasury/Asset'
import {
  getRealm,
  getTokenOwnerRecord,
  getTokenOwnerRecordAddress,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import BigNumber from 'bignumber.js'
import { UserGroupIcon } from '@heroicons/react/solid'

const getTokenOwnerRecordsForWallet = async (
  connection: ConnectionContext,
  walletAddress?: PublicKey | null
): Promise<TokenOwnerAsset[]> => {
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
        return {
          type: AssetType.TokenOwnerAsset,
          id: recordAddress.toBase58(),
          address: recordAddress.toBase58(),
          owner: walletAddress.toBase58(),
          realmId: realmData.pubkey.toBase58(),
          realmSymbol: r.symbol,
          programId: r.programId.toBase58(),
          mintAddress: realmData.account.communityMint.toBase58(),
          governingTokensDeposited: new BigNumber(
            recordData.account.governingTokenDepositAmount.toString()
          ),
          unrelinquishedVotes: recordData.account.unrelinquishedVotesCount,
          totalVotes: recordData.account.totalVotesCount,
          outstandingProposalCount: recordData.account.outstandingProposalCount,
          realmIcon: r.ogImage ? (
            <img src={r.ogImage} className="rounded-full h-6 w-auto" />
          ) : (
            <UserGroupIcon className="fill-fgd-1 h-6 w-6" />
          ),
        }
      } catch (e) {
        return null
      }
    })
  )
  tokenOwnerRecords = tokenOwnerRecords.filter((r) => r !== null)

  return tokenOwnerRecords as TokenOwnerAsset[]
}

export default getTokenOwnerRecordsForWallet
