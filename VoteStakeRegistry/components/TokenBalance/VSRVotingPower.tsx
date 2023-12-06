import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'

import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import { getMintDecimalAmount } from '@tools/sdk/units'

import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'
import BN from 'bn.js'
import { useVsrGovpower } from '@hooks/queries/plugins/vsr'
import VotingPowerBox from 'VoteStakeRegistry/components/TokenBalance/VotingPowerBox'
import { getMintMetadata } from '@components/instructions/programs/splToken'

interface Props {
  className?: string
}

export default function VSRCommunityVotingPower(props: Props) {
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result

  const deposits = useDepositStore((s) => s.state.deposits)

  const votingPower = useVsrGovpower().result?.result ?? new BN(0)
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

  if (isLoading || !(votingPower && mint)) {
    return (
      <div
        className={classNames(props.className, 'rounded-md bg-bkg-1 h-[76px]')}
      />
    )
  }

  return (
    <div className={props.className}>
      <VotingPowerBox
        votingPower={votingPower}
        mint={mint}
        votingPowerFromDeposits={votingPowerFromDeposits}
        className="p-3"
      />
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
