import useRealm from '@hooks/useRealm'
import { BigNumber } from 'bignumber.js'
import { LightningBoltIcon } from '@heroicons/react/solid'
import { useCallback } from 'react'

import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'
import useProposal from '@hooks/useProposal'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import { fmtMintAmount, getMintDecimalAmount } from '@tools/sdk/units'
import Tooltip from '@components/Tooltip'
import { SecondaryButton } from '@components/Button'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import { notify } from '@utils/notifications'

import { getMintMetadata } from '../instructions/programs/splToken'
import depositTokensVST from './depositTokensVSR'
import VotingPowerPct from './VotingPowerPct'

interface Props {
  className?: string
}

export default function LockedCommunityVotingPower(props: Props) {
  const {
    mint,
    ownTokenRecord,
    realm,
    realmInfo,
    realmTokenAccount,
  } = useRealm()
  const { proposal } = useProposal()
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const connection = useWalletStore((s) => s.connection.current)
  const deposits = useDepositStore((s) => s.state.deposits)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm)
  const fetchWalletTokenAccounts = useWalletStore(
    (s) => s.actions.fetchWalletTokenAccounts
  )
  const getOwnedDeposits = useDepositStore((s) => s.getOwnedDeposits)
  const votingPower = useDepositStore((s) => s.state.votingPower)
  const votingPowerFromDeposits = useDepositStore(
    (s) => s.state.votingPowerFromDeposits
  )
  const wallet = useWalletStore((s) => s.current)

  const depositRecord = deposits.find(
    (deposit) =>
      deposit.mint.publicKey.toBase58() ===
        realm!.account.communityMint.toBase58() && deposit.lockup.kind.none
  )

  const depositMint = realm?.account.communityMint
  const depositAmount = realmTokenAccount
    ? new BigNumber(realmTokenAccount.account.amount.toString())
    : new BigNumber(0)

  const tokenName =
    getMintMetadata(depositMint)?.name ?? realm?.account.name ?? ''

  const amount =
    votingPower && mint
      ? getMintDecimalAmount(mint, votingPower)
      : new BigNumber('0')

  const multiplier =
    !votingPower.isZero() && !votingPowerFromDeposits.isZero()
      ? (votingPower.toNumber() / votingPowerFromDeposits.toNumber()).toFixed(
          2
        ) + 'x'
      : null

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
      ? new BigNumber(
          calculateMaxVoteScore(realm, proposal, mint).toString()
        ).shiftedBy(-mint.decimals)
      : null

  const deposit = useCallback(async () => {
    if (
      client &&
      ownTokenRecord &&
      realm &&
      realmInfo &&
      realmTokenAccount &&
      wallet &&
      wallet.publicKey
    ) {
      try {
        await depositTokensVST({
          client,
          connection,
          endpoint,
          realm,
          realmInfo,
          realmTokenAccount,
          wallet,
          tokenOwnerRecordPk: ownTokenRecord.pubkey,
        })

        await getOwnedDeposits({
          client,
          connection,
          communityMintPk: realm.account.communityMint,
          realmPk: realm.pubkey,
          walletPk: wallet.publicKey,
        })

        await fetchWalletTokenAccounts()
        await fetchRealm(realmInfo.programId, realmInfo.realmId)
      } catch (e) {
        console.error(e)
        notify({ message: `Something went wrong ${e}`, type: 'error' })
      }
    }
  }, [
    client,
    connection,
    endpoint,
    fetchWalletTokenAccounts,
    fetchRealm,
    getOwnedDeposits,
    ownTokenRecord,
    realm,
    realmInfo,
    realmTokenAccount,
    wallet,
  ])

  return (
    <div className={props.className}>
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="text-white/50 text-xs">{tokenName} Votes</div>
        <div className="flex items-center justify-between mt-1">
          <div className="text-white font-bold text-2xl flex items-center">
            {amount.toFormat()}{' '}
            {multiplier && (
              <Tooltip content="Vote Weight Multiplier – Increase your vote weight by locking tokens">
                <div className="cursor-help flex font-normal items-center ml-3 text-xs rounded-full bg-bkg-3 px-2 py-1">
                  <LightningBoltIcon className="h-3 mr-1 text-primary-light w-3" />
                  {multiplier}
                </div>
              </Tooltip>
            )}
          </div>
          {max && !max.isZero() && (
            <VotingPowerPct amount={amount} total={max} />
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
      {depositAmount.isGreaterThan(0) && (
        <>
          <div className="mt-3 text-xs text-white/50">
            You have{' '}
            {mint
              ? depositAmount.shiftedBy(-mint.decimals).toFormat()
              : depositAmount.toFormat()}{' '}
            more {tokenName} votes in your wallet. Do you want to deposit them
            to increase your voting power in this Realm?
          </div>
          <SecondaryButton className="mt-4 w-48" onClick={deposit}>
            Deposit
          </SecondaryButton>
        </>
      )}
    </div>
  )
}
