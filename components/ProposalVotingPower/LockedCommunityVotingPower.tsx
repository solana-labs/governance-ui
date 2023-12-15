import useRealm from '@hooks/useRealm'
import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import classNames from 'classnames'

import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { getMintMetadata } from '../instructions/programs/splToken'
import { useRealmQuery } from '@hooks/queries/realm'
import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'
import { useVsrGovpower } from '@hooks/queries/plugins/vsr'
import VSRCommunityVotingPower from 'VoteStakeRegistry/components/TokenBalance/VSRVotingPower'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'
import DepositCommunityTokensBtn from 'VoteStakeRegistry/components/TokenBalance/DepositCommunityTokensBtn'

interface Props {
  className?: string
}

export default function LockedCommunityVotingPower(props: Props) {
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result

  const { realmTokenAccount } = useRealm()

  const {
    data: votingPowerResult,
    isLoading: votingPowerLoading,
  } = useVsrGovpower()
  const votingPower = votingPowerResult?.result

  const isLoading = useDepositStore((s) => s.state.isLoading)

  const depositMint = realm?.account.communityMint
  const depositAmount = realmTokenAccount
    ? new BigNumber(realmTokenAccount.account.amount.toString())
    : new BigNumber(0)

  const tokenName =
    getMintMetadata(depositMint)?.name ?? realm?.account.name ?? ''

  const delegatedTors = useTokenOwnerRecordsDelegatedToUser()
  const selectedDelegator = useSelectedDelegatorStore(
    (s) => s.communityDelegator
  )
  // memoize useAsync inputs to prevent constant refetch
  const relevantDelegators = useMemo(
    () =>
      selectedDelegator !== undefined // ignore delegators if any delegator is selected
        ? []
        : delegatedTors
            ?.filter(
              (x) =>
                x.account.governingTokenMint.toString() ===
                realm?.account.communityMint.toString()
            )
            .map((x) => x.account.governingTokenOwner),
    [delegatedTors, realm?.account.communityMint, selectedDelegator]
  )

  if (isLoading || votingPowerLoading || !(votingPower && mint)) {
    return (
      <div
        className={classNames(
          props.className,
          'rounded-md bg-bkg-1 h-[76px] animate-pulse'
        )}
      />
    )
  }

  return (
    <div className={props.className}>
      {votingPower.isZero() && (relevantDelegators?.length ?? 0) < 1 ? (
        <div className={'text-xs text-white/50'}>
          You do not have any voting power in this dao.
        </div>
      ) : (
        <VSRCommunityVotingPower />
      )}

      {depositAmount.isGreaterThan(0) && (
        <>
          <div className="mt-3 text-xs text-white/50">
            You have{' '}
            {mint
              ? depositAmount.shiftedBy(-mint.decimals).toFormat()
              : depositAmount.toFormat()}{' '}
            more {tokenName} votes in your wallet. Do you want to deposit them
            to increase your voting power in this Dao?
          </div>
          <DepositCommunityTokensBtn inAccountDetails={false} />
        </>
      )}
    </div>
  )
}
