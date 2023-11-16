import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useAsync } from 'react-async-hook'
import { determineVotingPowerType } from '@hooks/queries/governancePower'
import { useConnection } from '@solana/wallet-adapter-react'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import LockedCommunityVotingPower from '@components/ProposalVotingPower/LockedCommunityVotingPower'
import NftVotingPower from '@components/ProposalVotingPower/NftVotingPower'
import LockedCommunityNFTRecordVotingPower from '@components/ProposalVotingPower/LockedCommunityNFTRecordVotingPower'
import VanillaVotingPower from './Vanilla/VanillaVotingPower'
import { Deposit } from './Vanilla/Deposit'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { ExclamationIcon } from '@heroicons/react/solid'

export default function GovernancePowerForRole({
  role,
  ...props
}: {
  role: 'community' | 'council'
  hideIfZero?: boolean
  className?: string
}) {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()

  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  //if dao transited to use plugin and some users have still deposited tokens they should withdraw before
  //depositing to plugin
  const didWithdrawFromVanillaSetup =
    !ownTokenRecord ||
    ownTokenRecord.account.governingTokenDepositAmount.isZero()

  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { result: kind } = useAsync(async () => {
    if (realmPk === undefined) return undefined
    return didWithdrawFromVanillaSetup
      ? determineVotingPowerType(connection, realmPk, role)
      : 'vanilla'
  }, [connection, realmPk, role, didWithdrawFromVanillaSetup])

  if (connected && kind === undefined && !props.hideIfZero) {
    return (
      <div className="animate-pulse bg-bkg-1 col-span-1 h-[76px] rounded-lg" />
    )
  }

  return (
    <>
      {role === 'community' ? (
        kind === 'vanilla' ? (
          <div>
            <VanillaVotingPower role="community" {...props} />
            <Deposit role="community" />
            {!didWithdrawFromVanillaSetup && (
              <small className="flex items-center mt-3 text-xs">
                <ExclamationIcon className="w-5 h-5 mr-2"></ExclamationIcon>
                Please withdraw your tokens and deposit again to get governance
                power
              </small>
            )}
          </div>
        ) : kind === 'VSR' ? (
          <LockedCommunityVotingPower />
        ) : kind === 'NFT' ? (
          <NftVotingPower />
        ) : kind === 'HeliumVSR' ? (
          <LockedCommunityNFTRecordVotingPower />
        ) : null
      ) : kind === 'vanilla' ? (
        <div>
          <VanillaVotingPower role="council" {...props} />
          <Deposit role="council" />
        </div>
      ) : null}
    </>
  )
}
