import useRealm from '@hooks/useRealm'
import { BigNumber } from 'bignumber.js'

import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'
import useProposal from '@hooks/useProposal'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import { fmtMintAmount, getMintDecimalAmount } from '@tools/sdk/units'

import { getMintMetadata } from '../instructions/programs/splToken'

interface Props {
  className?: string
}

export default function LockedCommunityVotingPower(props: Props) {
  const { mint, realm } = useRealm()
  const { proposal } = useProposal()
  const deposits = useDepositStore((s) => s.state.deposits)
  const votingPower = useDepositStore((s) => s.state.votingPower)

  const depositRecord = deposits.find(
    (deposit) =>
      deposit.mint.publicKey.toBase58() ===
        realm!.account.communityMint.toBase58() && deposit.lockup.kind.none
  )

  const depositMint = realm?.account.communityMint
  const tokenName =
    getMintMetadata(depositMint)?.name ?? realm?.account.name ?? ''

  const amount =
    votingPower && mint
      ? getMintDecimalAmount(mint, votingPower)
      : new BigNumber('0')

  const tokenAmount =
    depositRecord && mint
      ? new BigNumber(fmtMintAmount(mint, depositRecord.amountDepositedNative))
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
    realm && proposal && mint
      ? new BigNumber(calculateMaxVoteScore(realm, proposal, mint).toString())
      : null

  return (
    <div className={props.className}>
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="text-white/50 text-xs">{tokenName} Votes</div>
        <div className="flex items-center justify-between mt-1">
          <div className="text-white font-bold text-2xl">
            {amount.toFormat()}
          </div>
          {max && !max.isZero() && (
            <div className="text-[11px] leading-[15px] text-white/70 text-right">
              {amount.shiftedBy(2).dividedBy(max).toFixed(2)}% of total
              <br />
              voting power
            </div>
          )}
        </div>
      </div>
      <div className="pt-4 px-4">
        <p className="flex mb-1.5 text-xs">
          <span>{tokenName} Deposited</span>
          <span className="font-bold ml-auto text-fgd-1">
            {tokenAmount.toString()}
          </span>
        </p>
        <p className="flex text-xs">
          <span>{tokenName} Locked</span>
          <span className="font-bold ml-auto text-fgd-1">
            {lockedTokensAmount.toString()}
          </span>
        </p>
      </div>
    </div>
  )
}
