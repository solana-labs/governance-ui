import useRealm from '@hooks/useRealm'
import { BigNumber } from 'bignumber.js'
import { useCallback } from 'react'
import classNames from 'classnames'

import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import { getMintDecimalAmount } from '@tools/sdk/units'
import { SecondaryButton } from '@components/Button'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { notify } from '@utils/notifications'

import { getMintMetadata } from '../instructions/programs/splToken'
import depositTokensVSR from './depositTokensVSR'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'
import { useConnection } from '@solana/wallet-adapter-react'
import BN from 'bn.js'
import { useVsrGovpower } from '@hooks/queries/plugins/vsr'
import VotingPowerBox from 'VoteStakeRegistry/components/TokenBalance/VotingPowerBox'

interface Props {
  className?: string
}

export default function LockedCommunityVotingPower(props: Props) {
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result

  const { realmInfo, realmTokenAccount } = useRealm()
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const { connection } = useConnection()
  const deposits = useDepositStore((s) => s.state.deposits)

  const endpoint = connection.rpcEndpoint

  const getOwnedDeposits = useDepositStore((s) => s.getOwnedDeposits)
  const votingPower = useVsrGovpower().result?.result ?? new BN(0)
  const votingPowerFromDeposits = useDepositStore(
    (s) => s.state.votingPowerFromDeposits
  )
  const wallet = useWalletOnePointOh()
  const isLoading = useDepositStore((s) => s.state.isLoading)

  const currentTokenOwnerRecord = useUserCommunityTokenOwnerRecord().data
    ?.result

  const tokenOwnerRecordPk = currentTokenOwnerRecord
    ? currentTokenOwnerRecord.pubkey
    : null

  const depositRecord = deposits.find(
    (deposit) =>
      deposit.mint.publicKey.toBase58() ===
        realm?.account.communityMint.toBase58() && deposit.lockup.kind.none
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

  const deposit = useCallback(async () => {
    if (
      client &&
      realm &&
      realmInfo &&
      realmTokenAccount &&
      wallet &&
      wallet.publicKey
    ) {
      try {
        await depositTokensVSR({
          client,
          connection,
          endpoint,
          realm,
          realmInfo,
          realmTokenAccount,
          tokenOwnerRecordPk,
          wallet,
        })

        await getOwnedDeposits({
          client,
          connection,
          communityMintPk: realm.account.communityMint,
          realmPk: realm.pubkey,
          walletPk: wallet.publicKey,
        })
      } catch (e) {
        console.error(e)
        notify({ message: `Something went wrong ${e}`, type: 'error' })
      }
    }
  }, [
    client,
    connection,
    endpoint,
    getOwnedDeposits,
    realm,
    realmInfo,
    realmTokenAccount,
    tokenOwnerRecordPk,
    wallet,
  ])

  if (isLoading || !(votingPower && mint)) {
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
        <>
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
                {lockedTokensAmount.isNaN()
                  ? '0'
                  : lockedTokensAmount.toFormat()}
              </span>
            </p>
          </div>
        </>
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
          <SecondaryButton className="mt-4 w-48" onClick={deposit}>
            Deposit
          </SecondaryButton>
        </>
      )}
    </div>
  )
}
