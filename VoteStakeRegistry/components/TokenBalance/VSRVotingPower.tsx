import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'

import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import { getMintDecimalAmount } from '@tools/sdk/units'

import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'
import BN from 'bn.js'
import { useVsrGovpowerMulti } from '@hooks/queries/plugins/vsr'
import VotingPowerBox from 'VoteStakeRegistry/components/TokenBalance/VotingPowerBox'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'
import { useMemo } from 'react'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'

interface Props {
  className?: string,
  votingPower: BN | undefined,
  votingPowerLoading: boolean
  isLastPlugin: boolean
}

export default function VSRCommunityVotingPower({ className, votingPower, votingPowerLoading, isLastPlugin }: Props) {
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result

  const deposits = useDepositStore((s) => s.state.deposits)

  const votingPowerFromDeposits = useDepositStore(
    (s) => s.state.votingPowerFromDeposits
  )
  const isLoading = useDepositStore((s) => s.state.isLoading)

  const depositRecord = deposits.find(
    (deposit) =>
      deposit.mint.publicKey.toBase58() ===
        realm?.account.communityMint.toBase58() && deposit.lockup.kind.none
  )

  const depositMint = realm?.account.communityMint

  const tokenName =
    getMintMetadata(depositMint)?.name ?? realm?.account.name ?? ''

  const tokenAmount =
    depositRecord && mint
      ? new BigNumber(
          getMintDecimalAmount(mint, depositRecord.amountDepositedNative)
        )
      : new BigNumber('0')

  const lockedTokensAmount = mint
    ? deposits
        .filter(
          (x) =>
            typeof x.lockup.kind['none'] === 'undefined' &&
            x.mint.publicKey.toBase58() ===
              realm?.account.communityMint.toBase58()
        )
        .reduce(
          (curr, next) =>
            curr.plus(new BigNumber(next.currentlyLocked.toString())),
          new BigNumber(0)
        )
        .shiftedBy(-mint.decimals)
    : new BigNumber('0')

  const { data: delegatedTors } = useTokenOwnerRecordsDelegatedToUser()
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
  const { data: delegatorPowers } = useVsrGovpowerMulti(relevantDelegators)
  const totalDelegatorPower =
    delegatorPowers &&
    mint &&
    Object.values(delegatorPowers).reduce(
      (sum, curr) => sum.add(curr),
      new BN(0)
    )
  const formattedDelegatorPower =
    totalDelegatorPower &&
    new BigNumber(totalDelegatorPower.toString()).shiftedBy(-mint.decimals)

  //const totalPower = votingPower.add(totalDelegatorPower ?? new BN(0))

  if (isLoading || mint === undefined || votingPowerLoading) {
    return (
      <div
        className={classNames(
          className,
          'rounded-md bg-bkg-1 h-[76px] animate-pulse'
        )}
      />
    )
  }

  return (
    <div className={className}>
      <VotingPowerBox
        votingPower={votingPower ?? new BN(0)}
        mint={mint}
        votingPowerFromDeposits={votingPowerFromDeposits}
        isLastPlugin={isLastPlugin}
        className="p-3"
      />
      <div className="flex flex-col pt-4 px-4 gap-1.5">
        <p className="flex text-xs">
          <span>{tokenName} Deposited</span>
          <span className="font-bold ml-auto text-fgd-1">
            {tokenAmount.isNaN() ? '0' : tokenAmount.toFormat()}
          </span>
        </p>
        <p className="flex text-xs">
          <span>{tokenName} Locked</span>
          <span className="font-bold ml-auto text-fgd-1">
            {lockedTokensAmount.isNaN() ? '0' : lockedTokensAmount.toFormat()}
          </span>
        </p>
        {formattedDelegatorPower?.gt(new BigNumber(0)) && (
          <p className="flex text-xs">
            <span>Votes from delegators</span>
            <span className="font-bold ml-auto text-fgd-1">
              {formattedDelegatorPower.isNaN()
                ? '0'
                : formattedDelegatorPower.toFormat()}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
