import { DisplayAddress } from '@cardinal/namespaces-components'
import Select from '@components/inputs/Select'
import useMembersStore from 'stores/useMembersStore'
import useRealm from 'hooks/useRealm'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'
import { PublicKey } from '@solana/web3.js'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const DelegateBalanceCard = () => {
  const delegates = useMembersStore((s) => s.compact.delegates)
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const walletId = wallet?.publicKey?.toBase58()
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result

  const { ownDelegateTokenRecords, ownDelegateCouncilTokenRecords } = useRealm()

  const {
    setCommunityDelegator,
    setCouncilDelegator,
  } = useSelectedDelegatorStore()

  const getCouncilDelegateAmt = () => {
    if (walletId && delegates?.[walletId]) {
      return delegates?.[walletId]?.councilMembers?.length ?? 0
    }
    return 0
  }

  const getCommunityDelegateAmt = () => {
    if (walletId && delegates?.[walletId]) {
      return delegates?.[walletId]?.communityMembers?.length ?? 0
    }
    return 0
  }

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

  if (!walletId || !delegates?.[walletId]) {
    return null
  }

  return (
    <>
      <h3 className="mb-0 mt-2">Your Delegates</h3>
      {walletId && delegates?.[walletId]?.councilMembers && (
        <div className="flex space-x-4 items-center mt-4">
          <div className="bg-bkg-1 px-4 py-2 justify-between rounded-md w-full">
            <div className="flex flex-row justify-between w-full mb-2">
              <div>
                <p className="text-fgd-3 text-xs">Delegate Accounts</p>
                <p className="font-bold mb-0 text-fgd-1 text-xl">
                  {getCouncilDelegateAmt()}
                </p>
              </div>
            </div>

            <p className="text-fgd-3 text-xs mb-1">Selected Delegate</p>
            <Select
              value={
                (ownCouncilTokenRecord &&
                  ownCouncilTokenRecord?.account?.governingTokenOwner?.toBase58()) ||
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
                        ownCouncilTokenRecord?.account?.governingTokenOwner
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
              {ownDelegateCouncilTokenRecords?.map((councilDelegate) => (
                <Select.Option
                  key={councilDelegate?.account?.governingTokenOwner?.toBase58()}
                  value={councilDelegate?.account?.governingTokenOwner?.toBase58()}
                >
                  <div className="relative">
                    <DisplayAddress
                      connection={connection.current}
                      address={councilDelegate?.account?.governingTokenOwner}
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
      {walletId && delegates?.[walletId]?.communityMembers && (
        <div className="flex space-x-4 items-center mt-4">
          <div className="bg-bkg-1 px-4 py-2 justify-between rounded-md w-full">
            <div className="flex flex-row justify-between w-full mb-2">
              <div>
                <p className="text-fgd-3 text-xs">Delegate Accounts</p>
                <p className="font-bold mb-0 text-fgd-1 text-xl">
                  {getCommunityDelegateAmt()}
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
              {ownDelegateTokenRecords?.map((communityDelegate) => (
                <Select.Option
                  key={communityDelegate?.account?.governingTokenOwner?.toBase58()}
                  value={communityDelegate?.account?.governingTokenOwner?.toBase58()}
                >
                  <div className="relative">
                    <DisplayAddress
                      connection={connection.current}
                      address={communityDelegate?.account?.governingTokenOwner}
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
