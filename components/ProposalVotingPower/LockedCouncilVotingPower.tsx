import useRealm from '@hooks/useRealm'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'

import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'
import useProposal from '@hooks/useProposal'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import { fmtMintAmount, getMintDecimalAmount } from '@tools/sdk/units'

import { getMintMetadata } from '../instructions/programs/splToken'
import VotingPowerPct from './VotingPowerPct'

interface Props {
  className?: string
}

export default function LockedCouncilVotingPower(props: Props) {
  const { councilMint, realm } = useRealm()
  const { proposal } = useProposal()
  const deposits = useDepositStore((s) => s.state.deposits)
  const votingPower = useDepositStore((s) => s.state.votingPower)
  const isLoading = useDepositStore((s) => s.state.isLoading)

  const depositRecord = deposits.find(
    (deposit) =>
      deposit.mint.publicKey.toBase58() ===
        realm!.account.communityMint.toBase58() && deposit.lockup.kind.none
  )

  const depositMint = realm?.account.config.councilMint
  const tokenName =
    getMintMetadata(depositMint)?.name ?? realm?.account.name ?? ''

  const amount =
    votingPower && councilMint
      ? getMintDecimalAmount(councilMint, votingPower)
      : new BigNumber('0')

  const tokenAmount =
    depositRecord && councilMint
      ? new BigNumber(
          fmtMintAmount(councilMint, depositRecord.amountDepositedNative)
        )
      : new BigNumber('0')

  const lockedTokensAmount = deposits
    .filter(
      (x) =>
        typeof x.lockup.kind['none'] === 'undefined' &&
        x.mint.publicKey.toBase58() === realm?.account.communityMint.toBase58()
    )
    .reduce(
      (curr, next) => curr.plus(new BigNumber(next.currentlyLocked.toString())),
      new BigNumber(0)
    )

  const max =
    realm && proposal && councilMint
      ? new BigNumber(
          calculateMaxVoteScore(realm, proposal, councilMint).toString()
        ).shiftedBy(-councilMint.decimals)
      : null

  if (isLoading || !(votingPower && councilMint)) {
    return (
      <div
        className={classNames(props.className, 'rounded-md bg-bkg-1 h-[76px]')}
      />
    )
  }

  return (
    <div className={props.className}>
      {amount.isZero() ? (
        <div className={'text-xs text-white/50'}>
          You do not have any voting power in this dao.
        </div>
      ) : (
        <div className={'p-3 rounded-md bg-bkg-1'}>
          <div className="text-white/50 text-xs">{tokenName} Council Votes</div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-white font-bold text-2xl">
              {amount.toFormat()}
            </div>
            {max && !max.isZero() && (
              <VotingPowerPct amount={amount} total={max} />
            )}
          </div>
        </div>
      )}
      <div className="pt-4 px-4">
        <p className="flex mb-1.5 text-xs">
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
      </div>
    </div>
  )
}
