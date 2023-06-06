import { DisplayAddress } from '@cardinal/namespaces-components'
import Select from '@components/inputs/Select'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  useTokenOwnerRecordsDelegatedToUser,
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'
import { PublicKey } from '@solana/web3.js'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { useRealmQuery } from '@hooks/queries/realm'
import { useMemo } from 'react'

const DelegateBalanceCard = () => {
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const walletId = wallet?.publicKey?.toBase58()
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result
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

  const {
    setCommunityDelegator,
    setCouncilDelegator,
  } = useSelectedDelegatorStore()

  const handleCouncilSelect = (councilTokenRecord?: string) => {
    setCouncilDelegator(
      councilTokenRecord ? new PublicKey(councilTokenRecord) : undefined
    )
  }

  const handleCommunitySelect = (communityPubKey?: string) => {
    setCommunityDelegator(
      communityPubKey ? new PublicKey(communityPubKey) : undefined
    )
  }

  if (!walletId) {
    return null
  }

  return (
    <>
      <h3 className="mb-0 mt-2">Your Delegates</h3>
      {walletId &&
        councilTorsDelegatedToUser &&
        councilTorsDelegatedToUser.length > 0 && (
          <div className="flex space-x-4 items-center mt-4">
            <div className="bg-bkg-1 px-4 py-2 justify-between rounded-md w-full">
              <div className="flex flex-row justify-between w-full mb-2">
                <div>
                  <p className="text-fgd-3 text-xs">Delegate Accounts</p>
                  <p className="font-bold mb-0 text-fgd-1 text-xl">
                    {councilTorsDelegatedToUser?.length ?? 0}
                  </p>
                </div>
              </div>

              <p className="text-fgd-3 text-xs mb-1">Selected Delegate</p>
              <Select
                value={
                  (ownCouncilTokenRecord &&
                    ownCouncilTokenRecord.account.governingTokenOwner.toBase58()) ||
                  ''
                }
                placeholder="Delegate to use for council votes"
                onChange={handleCouncilSelect}
                componentLabel={
                  ownCouncilTokenRecord ? (
                    <div className="relative">
                      <DisplayAddress
                        connection={connection.current}
                        address={
                          ownCouncilTokenRecord.account.governingTokenOwner
                        }
                        height="12px"
                        width="100px"
                        dark={true}
                      />
                      <div className="absolute bg-bkg-1 bottom-0 left-0 w-full h-full opacity-0	" />
                    </div>
                  ) : (
                    ''
                  )
                }
              >
                <Select.Option key={'reset'} value={undefined}>
                  Use own wallet
                </Select.Option>
                {councilTorsDelegatedToUser?.map((councilDelegate) => (
                  <Select.Option
                    key={councilDelegate.account.governingTokenOwner.toBase58()}
                    value={councilDelegate.account.governingTokenOwner.toBase58()}
                  >
                    <div className="relative">
                      <DisplayAddress
                        connection={connection.current}
                        address={councilDelegate.account.governingTokenOwner}
                        height="12px"
                        width="100px"
                        dark={true}
                      />
                      <div className="absolute bg-bkg-1 bottom-0 left-0 w-full h-full opacity-0	" />
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        )}
      {walletId &&
        communityTorsDelegatedToUser &&
        communityTorsDelegatedToUser.length > 0 && (
          <div className="flex space-x-4 items-center mt-4">
            <div className="bg-bkg-1 px-4 py-2 justify-between rounded-md w-full">
              <div className="flex flex-row justify-between w-full mb-2">
                <div>
                  <p className="text-fgd-3 text-xs">Delegate Accounts</p>
                  <p className="font-bold mb-0 text-fgd-1 text-xl">
                    {communityTorsDelegatedToUser.length ?? 0}
                  </p>
                </div>
              </div>

              <p className="text-fgd-3 text-xs mb-1">Selected Delegate</p>
              <Select
                value={
                  (ownTokenRecord &&
                    ownTokenRecord.account.governingTokenOwner.toBase58()) ||
                  ''
                }
                placeholder="Delegate to use for community votes"
                onChange={handleCommunitySelect}
                componentLabel={
                  ownTokenRecord ? (
                    <div className="relative">
                      <DisplayAddress
                        connection={connection.current}
                        address={ownTokenRecord.account.governingTokenOwner}
                        height="12px"
                        width="100px"
                        dark={true}
                      />
                      <div className="absolute bg-bkg-1 bottom-0 left-0 w-full h-full opacity-0	" />
                    </div>
                  ) : (
                    ''
                  )
                }
              >
                <Select.Option key={'reset'} value={''}>
                  Use own wallet
                </Select.Option>
                {communityTorsDelegatedToUser.map((communityDelegate) => (
                  <Select.Option
                    key={communityDelegate.account.governingTokenOwner.toBase58()}
                    value={communityDelegate.account.governingTokenOwner.toBase58()}
                  >
                    <div className="relative">
                      <DisplayAddress
                        connection={connection.current}
                        address={communityDelegate.account.governingTokenOwner}
                        height="12px"
                        width="100px"
                        dark={true}
                      />
                      <div className="absolute bg-bkg-1 bottom-0 left-0 w-full h-full opacity-0	" />
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        )}
    </>
  )
}

export default DelegateBalanceCard
