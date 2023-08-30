import { getCertifiedRealmInfos, RealmInfo } from '@models/registry/api'
import { AssetType, TokenOwnerRecordAsset } from '@models/treasury/Asset'
import {
  Governance,
  GovernanceAccountParser,
  GOVERNANCE_PROGRAM_SEED,
  ProgramAccount,
  Realm,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { AccountInfo, PublicKey } from '@solana/web3.js'
import { ConnectionContext } from '@utils/connection'
import {
  MintAccount,
  parseMintAccountData,
  TokenProgramAccount,
} from '@utils/tokens'
import axios from 'axios'

const getAccountInfoFromRaw = (raw: any) => {
  const accountInfo: AccountInfo<Buffer> = {
    executable: raw.executable,
    lamports: raw.lamports,
    owner: new PublicKey(raw.owner),
    rentEpoch: raw.rentEpoch,
    data: Buffer.from(raw.data[0], 'base64'),
  }
  return accountInfo
}

const getTokenOwnerRecordsForWallet = async (
  connection: ConnectionContext,
  governanceAccount: ProgramAccount<Governance>,
  walletAddress?: PublicKey | null
): Promise<TokenOwnerRecordAsset[]> => {
  if (!walletAddress) return []

  const realmInfos = getCertifiedRealmInfos(connection)

  const cacheMap: Record<
    number,
    { tokenOwnerRecord: PublicKey; realmInfo: RealmInfo }
  > = {}

  const jsonRpcRequestData = realmInfos
    .map((realm, i) => {
      if (!realm.communityMint) return null

      const [tokenOwnerRecordAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(GOVERNANCE_PROGRAM_SEED),
          realm.realmId.toBuffer(),
          realm.communityMint.toBuffer(),
          walletAddress.toBuffer(),
        ],
        realm.programId
      )

      cacheMap[i] = {
        tokenOwnerRecord: tokenOwnerRecordAddress,
        realmInfo: realm,
      }

      return {
        jsonrpc: '2.0',
        id: i,
        method: 'getMultipleAccounts',
        params: [
          [
            realm.realmId.toBase58(),
            tokenOwnerRecordAddress.toBase58(),
            realm.communityMint.toBase58(),
          ],
          {
            commitment: connection.current.commitment,
            encoding: 'base64',
          },
        ],
      }
    })
    .filter((x) => x !== null)

  // TODO BATCH ALERT
  // solution: kill this entire function. use react-query.
  try {
    const rawAccountData = await axios.request({
      url: connection.endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(jsonRpcRequestData),
    })

    const parsedAccounts = rawAccountData.data
      .map((rawRealmData) => {
        try {
          const id = rawRealmData.id
          const tokenOwnerRecordAccountInfo = getAccountInfoFromRaw(
            rawRealmData.result.value[1]
          )
          const realmAccountInfo = getAccountInfoFromRaw(
            rawRealmData.result.value[0]
          )
          const communityMintAccountInfo = getAccountInfoFromRaw(
            rawRealmData.result.value[2]
          )

          const realmAccount = GovernanceAccountParser(Realm)(
            cacheMap[id].realmInfo.realmId,
            realmAccountInfo
          ) as ProgramAccount<Realm>
          const tokenOwnerRecordAccount = GovernanceAccountParser(
            TokenOwnerRecord
          )(
            cacheMap[id].tokenOwnerRecord,
            tokenOwnerRecordAccountInfo
          ) as ProgramAccount<TokenOwnerRecord>

          const mintAccount: TokenProgramAccount<MintAccount> = {
            publicKey: cacheMap[id].realmInfo.communityMint!, // already checking above if present
            account: parseMintAccountData(communityMintAccountInfo.data),
          }

          return {
            id,
            realm: realmAccount,
            tokenOwnerRecord: tokenOwnerRecordAccount,
            mint: mintAccount,
            realmInfo: cacheMap[id].realmInfo,
          }
        } catch (e) {
          return null
        }
      })
      .filter((x) => x !== null)

    const tokenOwnerRecordAssets = parsedAccounts.map((a) => ({
      type: AssetType.TokenOwnerRecordAsset,
      id: a.tokenOwnerRecord.pubkey.toBase58(),
      address: a.tokenOwnerRecord.pubkey,
      owner: walletAddress,
      programId: a.realmInfo.programId.toBase58(),
      realmId: a.realm.pubkey.toBase58(),
      displayName: a.realmInfo.displayName
        ? a.realmInfo.displayName
        : a.realm.name,
      realmSymbol: a.realmInfo.symbol,
      realmImage: a.realmInfo.ogImage ? a.realmInfo.ogImage : undefined,
      communityMint: a.mint,
      realmAccount: a.realm,
      tokenOwnerRecordAccount: a.tokenOwnerRecord,
      governanceOwner: governanceAccount,
    }))

    return tokenOwnerRecordAssets as TokenOwnerRecordAsset[]
  } catch (e) {
    console.error('[serum_gov] error fetching token owner records: ', e)
    return []
  }
}

export default getTokenOwnerRecordsForWallet
