import useRealm from '@hooks/useRealm'
import { BigNumber } from 'bignumber.js'
import { useCallback, useMemo } from 'react'
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
import {
  useTokenOwnerRecordsDelegatedToUser,
  useUserCommunityTokenOwnerRecord,
} from '@hooks/queries/tokenOwnerRecord'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'
import { useConnection } from '@solana/wallet-adapter-react'
import BN from 'bn.js'
import { useVsrGovpower } from '@hooks/queries/plugins/vsr'
import VSRCommunityVotingPower from 'VoteStakeRegistry/components/TokenBalance/VSRVotingPower'
import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'

interface Props {
  className?: string
}

export default function LockedCommunityVotingPower(props: Props) {
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result

  const { realmInfo, realmTokenAccount } = useRealm()
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const { connection } = useConnection()
  const endpoint = connection.rpcEndpoint

  const getOwnedDeposits = useDepositStore((s) => s.getOwnedDeposits)
  const votingPower = useVsrGovpower().data?.result ?? new BN(0)

  const wallet = useWalletOnePointOh()
  const isLoading = useDepositStore((s) => s.state.isLoading)

  const currentTokenOwnerRecord = useUserCommunityTokenOwnerRecord().data
    ?.result

  const tokenOwnerRecordPk = currentTokenOwnerRecord
    ? currentTokenOwnerRecord.pubkey
    : null

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

  if (isLoading || !(votingPower && mint)) {
    return (
      <div
        className={classNames(props.className, 'rounded-md bg-bkg-1 h-[76px]')}
      />
    )
  }

  return (
    <div className={props.className}>
      {amount.isZero() && (relevantDelegators?.length ?? 0) < 1 ? (
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
          <SecondaryButton className="mt-4 w-48" onClick={deposit}>
            Deposit
          </SecondaryButton>
        </>
      )}
    </div>
  )
}
