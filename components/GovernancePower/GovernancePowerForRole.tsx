import classNames from 'classnames'

import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useAsync } from 'react-async-hook'
import { determineVotingPowerType } from '@hooks/queries/governancePower'
import { useConnection } from '@solana/wallet-adapter-react'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import VanillaVotingPower from '@components/ProposalVotingPower/VanillaVotingPower'
import LockedCommunityVotingPower from '@components/ProposalVotingPower/LockedCommunityVotingPower'
import NftVotingPower from '@components/ProposalVotingPower/NftVotingPower'
import LockedCommunityNFTRecordVotingPower from '@components/ProposalVotingPower/LockedCommunityNFTRecordVotingPower'

export default function GovernancePowerForRole({
  role,
  ...props
}: {
  role: 'community' | 'council'
  className?: string
}) {
  const { connection } = useConnection()

  const realmPk = useSelectedRealmPubkey()

  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { result: kind } = useAsync(async () => {
    if (realmPk === undefined) return undefined

    return determineVotingPowerType(connection, realmPk, role)
  }, [connection, realmPk, role])

  if (connected && kind === undefined) {
    return (
      <div className="animate-pulse bg-bkg-1 col-span-1 h-[76px] rounded-lg" />
    )
  }

  return (
    <div className={classNames(props.className)}>
      {role === 'community' ? (
        kind === 'vanilla' ? (
          <VanillaVotingPower role="community" />
        ) : kind === 'VSR' ? (
          <LockedCommunityVotingPower />
        ) : kind === 'NFT' ? (
          <NftVotingPower />
        ) : kind === 'HeliumVSR' ? (
          <LockedCommunityNFTRecordVotingPower />
        ) : null
      ) : kind === 'vanilla' ? (
        <VanillaVotingPower role="council" />
      ) : null}
    </div>
  )
}
