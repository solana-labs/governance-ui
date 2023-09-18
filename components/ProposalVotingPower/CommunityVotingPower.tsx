import { BigNumber } from 'bignumber.js'
import { useCallback, useMemo } from 'react'
import classNames from 'classnames'

import useRealm from '@hooks/useRealm'
import { SecondaryButton } from '@components/Button'

import { getMintMetadata } from '../instructions/programs/splToken'
import depositTokens from './depositTokens'
import VotingPowerPct from './VotingPowerPct'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'
import { useConnection } from '@solana/wallet-adapter-react'
import { getVanillaGovpower } from '@hooks/queries/governancePower'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwnerRecord'
import { useAsync } from 'react-async-hook'
import BN from 'bn.js'

interface Props {
  className?: string
}

const Deposit = () => {
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const { realmInfo, realmTokenAccount } = useRealm()
  const { connection } = useConnection()
  const wallet = useWalletOnePointOh()

  // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  const depositAmount = realmTokenAccount
    ? new BigNumber(realmTokenAccount.account.amount.toString())
    : new BigNumber(0)

  const depositMint = realm?.account.communityMint
  const tokenName =
    getMintMetadata(depositMint)?.name ?? realm?.account.name ?? ''

  const deposit = useCallback(async () => {
    if (depositAmount && realmTokenAccount && realmInfo && realm && wallet) {
      await depositTokens({
        connection,
        realmInfo,
        realm,
        wallet,
        amount: depositAmount,
        depositTokenAccount: realmTokenAccount,
      })
    }
  }, [depositAmount, connection, realmTokenAccount, realmInfo, realm, wallet])

  return !depositAmount.isGreaterThan(0) ? null : (
    <>
      <div className="mt-3 text-xs text-white/50">
        You have{' '}
        {mint
          ? depositAmount.shiftedBy(-mint.decimals).toFormat()
          : depositAmount.toFormat()}{' '}
        more {tokenName} votes in your wallet. Do you want to deposit them to
        increase your voting power in this Dao?
      </div>
      <SecondaryButton className="mt-4 w-48" onClick={deposit}>
        Deposit
      </SecondaryButton>
    </>
  )
}

export default function CommunityVotingPower(props: Props) {
  const realm = useRealmQuery().data?.result
  const mintInfo = useRealmCommunityMintInfoQuery().data?.result
  const { realmInfo } = useRealm()

  const { data: communityTOR } = useAddressQuery_CommunityTokenOwner()
  const { connection } = useConnection()

  const { result: personalAmount } = useAsync(
    async () => communityTOR && getVanillaGovpower(connection, communityTOR),
    [communityTOR, connection]
  )

  const torsDelegatedToUser = useTokenOwnerRecordsDelegatedToUser()

  const { result: delegatorsAmount } = useAsync(
    async () =>
      torsDelegatedToUser === undefined || realm === undefined
        ? undefined
        : (
            await Promise.all(
              torsDelegatedToUser
                .filter((x) =>
                  x.account.governingTokenMint.equals(
                    realm.account.communityMint
                  )
                )
                .map((x) => getVanillaGovpower(connection, x.pubkey))
            )
          ).reduce((partialSum, a) => partialSum.add(a), new BN(0)),
    [connection, realm, torsDelegatedToUser]
  )

  const totalAmount = (delegatorsAmount ?? new BN(0)).add(
    personalAmount ?? new BN(0)
  )

  const formattedTotal = useMemo(
    () =>
      mintInfo && totalAmount !== undefined
        ? new BigNumber(totalAmount.toString())
            .shiftedBy(-mintInfo.decimals)
            .toString()
        : undefined,
    [totalAmount, mintInfo]
  )

  const formattedDelegatorsAmount = useMemo(
    () =>
      mintInfo && delegatorsAmount !== undefined
        ? new BigNumber(delegatorsAmount.toString())
            .shiftedBy(-mintInfo.decimals)
            .toString()
        : undefined,
    [delegatorsAmount, mintInfo]
  )

  const depositMint = realm?.account.communityMint
  const tokenName =
    getMintMetadata(depositMint)?.name ?? realm?.account.name ?? ''

  if (!(realm && realmInfo)) {
    return (
      <div
        className={classNames(props.className, 'rounded-md bg-bkg-1 h-[76px]')}
      />
    )
  }

  return (
    <div className={props.className}>
      {totalAmount === undefined || totalAmount.isZero() ? (
        <div className={'text-xs text-white/50'}>
          You do not have any voting power in this dao.
        </div>
      ) : (
        <div className={'p-3 rounded-md bg-bkg-1'}>
          <div className="text-white/50 text-xs">{tokenName} Votes</div>
          <div className="flex items-center justify-between mt-1">
            {delegatorsAmount?.gtn(0) ? (
              <div className="text-white font-bold text-2xl">
                {formattedTotal} ({formattedDelegatorsAmount}) from delegators
              </div>
            ) : undefined}
            {mintInfo && (
              <VotingPowerPct
                amount={new BigNumber(totalAmount.toString())}
                total={new BigNumber(mintInfo.supply.toString())}
              />
            )}
          </div>
        </div>
      )}
      <Deposit />
    </div>
  )
}
