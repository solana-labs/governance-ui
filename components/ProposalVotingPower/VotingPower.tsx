import classNames from 'classnames'

import CommunityVotingPower from './CommunityVotingPower'
import CouncilVotingPower from './CouncilVotingPower'
import LockedCommunityVotingPower from './LockedCommunityVotingPower'
import NftVotingPower from './NftVotingPower'
import LockedCommunityNFTRecordVotingPower from './LockedCommunityNFTRecordVotingPower'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useVotingPop } from '@components/VotePanel/hooks'
import { useAsync } from 'react-async-hook'
import { determineVotingPowerType } from '@hooks/queries/governancePower'
import { useConnection } from '@solana/wallet-adapter-react'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'

interface Props {
  className?: string
}

export default function VotingPower(props: Props) {
  const { connection } = useConnection()

  const realmPk = useSelectedRealmPubkey()
  const votePop = useVotingPop()

  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { result: kind } = useAsync(async () => {
    if (votePop === undefined || realmPk === undefined) return undefined

    return determineVotingPowerType(connection, realmPk, votePop)
  }, [connection, realmPk, votePop])

  if (connected && kind === undefined) {
    return (
      <div className="animate-pulse bg-bkg-1 col-span-1 h-[76px] rounded-lg" />
    )
  }

  return (
    <div className={classNames(props.className, 'space-y-2')}>
      {votePop === 'community' ? (
        kind === 'vanilla' ? (
          <CommunityVotingPower />
        ) : kind === 'VSR' ? (
          <LockedCommunityVotingPower />
        ) : kind === 'NFT' ? (
          <NftVotingPower />
        ) : kind === 'HeliumVSR' ? (
          <LockedCommunityNFTRecordVotingPower />
        ) : null
      ) : kind === 'vanilla' ? (
        <CouncilVotingPower />
      ) : null}
    </div>
  )
}
