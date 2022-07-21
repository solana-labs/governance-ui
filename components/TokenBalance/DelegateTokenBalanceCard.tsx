import useMembersStore from 'stores/useMembersStore'
import useWalletStore from 'stores/useWalletStore'
import Select from '@components/inputs/Select'
import useRealm from 'hooks/useRealm'
import { DisplayAddress } from '@cardinal/namespaces-components'
import { fmtMintAmount } from '@tools/sdk/units'
import { BN } from '@project-serum/anchor'
import { useEffect } from 'react'

const DelegateBalanceCard = () => {
  const delegates = useMembersStore((s) => s.compact.delegates)
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)

  const walletId = wallet?.publicKey?.toBase58()
  const {
    ownDelegateTokenRecords,
    ownDelegateCouncilTokenRecords,
    ownTokenRecord,
    ownCouncilTokenRecord,
    mint,
    councilMint,
  } = useRealm()
  const {
    actions,
    selectedCommunityDelegate,
    selectedCouncilDelegate,
  } = useWalletStore((s) => s)

  useEffect(() => {
    if (
      !ownCouncilTokenRecord &&
      ownDelegateCouncilTokenRecords &&
      ownDelegateCouncilTokenRecords.length > 0
    ) {
      actions.selectCouncilDelegate(
        ownDelegateCouncilTokenRecords[0]?.account?.governingTokenOwner?.toBase58()
      )
    }

    if (
      !ownTokenRecord &&
      ownDelegateTokenRecords &&
      ownDelegateTokenRecords.length > 0
    ) {
      actions.selectCommunityDelegate(
        ownDelegateTokenRecords[0]?.account?.governingTokenOwner?.toBase58()
      )
    }
  }, [walletId])

  // whenever we change delegate, get that delegates vote record so we can display it
  useEffect(() => {
    actions.fetchDelegateVoteRecords()
  }, [selectedCommunityDelegate, selectedCouncilDelegate])

  const getCouncilTokenCount = () => {
    if (walletId && delegates?.[walletId]) {
      return delegates?.[walletId].councilTokenCount || 0
    }
    return 0
  }

  const getCouncilDelegateAmt = () => {
    if (walletId && delegates?.[walletId]) {
      return fmtMintAmount(
        councilMint,
        new BN(delegates?.[walletId].councilTokenCount || 0)
      )
    }
    return 0
  }

  const getCommunityTokenCount = () => {
    if (walletId && delegates?.[walletId]) {
      return fmtMintAmount(
        mint,
        new BN(delegates?.[walletId].communityTokenCount || 0)
      )
    }
    return 0
  }

  const getCommunityDelegateAmt = () => {
    if (walletId && delegates?.[walletId]) {
      return delegates?.[walletId]?.communityMembers?.length || 0
    }
    return 0
  }

  const handleCouncilSelect = (councilTokenRecord: string) => {
    actions.selectCouncilDelegate(councilTokenRecord)
  }

  const handleCommunitySelect = (communityPubKey: string) => {
    actions.selectCommunityDelegate(communityPubKey)
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
                <p className="text-fgd-3 text-xs"> Council Votes</p>
                <p className="font-bold mb-0 text-fgd-1 text-xl">
                  {getCouncilTokenCount()}
                </p>
              </div>
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
              <Select.Option key={'reset'} value={''}>
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
                <p className="text-fgd-3 text-xs">Community Votes</p>
                <p className="font-bold mb-0 text-fgd-1 text-xl">
                  {getCommunityTokenCount()}
                </p>
              </div>
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
