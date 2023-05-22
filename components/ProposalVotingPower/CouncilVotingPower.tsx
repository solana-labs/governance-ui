import { BigNumber } from 'bignumber.js'
import { useCallback, useMemo } from 'react'
import classNames from 'classnames'

import useRealm from '@hooks/useRealm'
import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'
import { SecondaryButton } from '@components/Button'

import { getMintMetadata } from '../instructions/programs/splToken'
import getNumTokens from './getNumTokens'
import depositTokens from './depositTokens'
import VotingPowerPct from './VotingPowerPct'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCouncilTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmCouncilMintInfoQuery } from '@hooks/queries/mintInfo'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { useConnection } from '@solana/wallet-adapter-react'

interface Props {
  className?: string
}

export default function CouncilVotingPower(props: Props) {
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result

  const { councilTokenAccount, ownVoterWeight, realmInfo } = useRealm()
  const proposal = useRouteProposalQuery().data?.result
  const { connection } = useConnection()
  const wallet = useWalletOnePointOh()

  const depositAmount = useMemo(
    () =>
      councilTokenAccount
        ? new BigNumber(councilTokenAccount.account.amount.toString())
        : new BigNumber(0),
    [councilTokenAccount]
  )
  const depositMint = realm?.account.config.councilMint
  const tokenName =
    getMintMetadata(depositMint)?.name ?? realm?.account.name ?? ''

  const amount = getNumTokens(
    ownVoterWeight,
    ownCouncilTokenRecord,
    councilMint,
    realmInfo
  )

  const max =
    realm && proposal && councilMint
      ? new BigNumber(
          calculateMaxVoteScore(realm, proposal, councilMint).toString()
        ).shiftedBy(-councilMint.decimals)
      : null

  const deposit = useCallback(async () => {
    if (depositAmount && councilTokenAccount && realmInfo && realm && wallet) {
      await depositTokens({
        connection,
        realmInfo,
        realm,
        wallet,
        amount: depositAmount,
        depositTokenAccount: councilTokenAccount,
      })
    }
  }, [depositAmount, connection, councilTokenAccount, realmInfo, realm, wallet])

  if (!(realm && realmInfo)) {
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
          You do not have any council voting power in this dao.
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
      {depositAmount.isGreaterThan(0) && (
        <>
          <div className="mt-3 text-xs text-white/50">
            You have{' '}
            {councilMint
              ? depositAmount.shiftedBy(-councilMint.decimals).toFormat()
              : depositAmount.toFormat()}{' '}
            more {tokenName} council votes in your wallet. Do you want to
            deposit them to increase your voting power in this Dao?
          </div>
          <SecondaryButton className="mt-4 w-48" onClick={deposit}>
            Deposit
          </SecondaryButton>
        </>
      )}
    </div>
  )
}
