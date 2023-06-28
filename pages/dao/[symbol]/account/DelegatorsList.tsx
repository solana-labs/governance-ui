import { useRealmQuery } from '@hooks/queries/realm'
import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useConnection } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'

const DelegatorsList = () => {
  const wallet = useWalletOnePointOh()
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result

  const delegatesArray = useTokenOwnerRecordsDelegatedToUser()

  // returns array of community tokenOwnerRecords that connected wallet has been delegated
  const communityTorsDelegatedToUser = useMemo(
    () =>
      realm === undefined
        ? undefined
        : delegatesArray?.filter((x) =>
            x.account.governingTokenMint.equals(realm.account.communityMint)
          ),
    [delegatesArray, realm]
  )

  const councilMintAddr = realm?.account.config.councilMint

  // returns array of council tokenOwnerRecords that connected wallet has been delegated
  const councilTorsDelegatedToUser = useMemo(
    () =>
      councilMintAddr === undefined
        ? undefined
        : delegatesArray?.filter((x) =>
            x.account.governingTokenMint.equals(councilMintAddr)
          ),
    [delegatesArray, councilMintAddr]
  )

  return (
    <div>
      {communityTorsDelegatedToUser?.map((x) => (
        <div key={x.pubkey.toString()}>
          {x.account.governingTokenOwner.toString()}
        </div>
      ))}
    </div>
  )
}

export default DelegatorsList
