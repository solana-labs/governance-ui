import Button from '@components/Button'
//import Loading from '@components/Loading'
//import NFTSelector from '@components/NFTS/NFTSelector'
import { ChevronRightIcon } from '@heroicons/react/outline'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { getTokenOwnerRecordAddress } from '@solana/spl-governance'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import useSwitchboardPluginStore from 'SwitchboardVotePlugin/store/switchboardStore'
import { sbRefreshWeight } from '../../actions/switchboardRefreshVoterWeight'
import { useRealmQuery } from '@hooks/queries/realm'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

const SwitchboardPermissionCard = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const switchboardVoterWeight = useSwitchboardPluginStore(
    (s) => s.state.votingPower
  )
  const switchboardRefreshInstructions = useSwitchboardPluginStore(
    (s) => s.state.instructions
  )

  const [tokenOwnerRecordPk, setTokenOwneRecordPk] = useState('')
  const realm = useRealmQuery().data?.result
  const { symbol } = useRealm()
  const connection = useLegacyConnectionContext()

  useEffect(() => {
    const getTokenOwnerRecord = async () => {
      const defaultMint = realm!.account.communityMint
      const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
        realm!.owner,
        realm!.pubkey,
        defaultMint!,
        wallet!.publicKey!
      )
      setTokenOwneRecordPk(tokenOwnerRecordAddress.toBase58())
    }
    if (realm && wallet?.connected) {
      getTokenOwnerRecord()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realm?.pubkey.toBase58(), wallet?.connected])
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="mb-0">Your Queue Voting Rights:</h3>
        <Link href={fmtUrlWithCluster(`/dao/${symbol}/account/me`)}>
          <a
            className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3 ${
              !connected || !tokenOwnerRecordPk
                ? 'opacity-50 pointer-events-none'
                : ''
            }`}
          >
            View
            <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
          </a>
        </Link>
      </div>
      <div className="space-y-4">
        {(() => {
          if (switchboardVoterWeight.isZero()) {
            return <span>You do not have voting rights</span>
          } else {
            return <span>You have voting rights!</span>
          }
        })()}
      </div>
      <Button
        className="w-full"
        onClick={() => {
          sbRefreshWeight(switchboardRefreshInstructions[0], connection, wallet)
        }}
      >
        Refresh Voting Rights
      </Button>
    </>
  )
}
export default SwitchboardPermissionCard
