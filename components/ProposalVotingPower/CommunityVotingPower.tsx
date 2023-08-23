import { BigNumber } from 'bignumber.js'
import { useCallback } from 'react'
import classNames from 'classnames'

import useRealm from '@hooks/useRealm'
import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'
import { SecondaryButton } from '@components/Button'

import { getMintMetadata } from '../instructions/programs/splToken'
import getNumTokens from './getNumTokens'
import depositTokens from './depositTokens'
import VotingPowerPct from './VotingPowerPct'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { useConnection } from '@solana/wallet-adapter-react'
import { useLegacyVoterWeight } from '@hooks/queries/governancePower'

interface Props {
  className?: string
}

export default function CommunityVotingPower(props: Props) {
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const { result: ownVoterWeight } = useLegacyVoterWeight()
  const { realmInfo, realmTokenAccount } = useRealm()
  const proposal = useRouteProposalQuery().data?.result
  const { connection } = useConnection()
  const wallet = useWalletOnePointOh()

  // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  const depositAmount = realmTokenAccount
    ? new BigNumber(realmTokenAccount.account.amount.toString())
    : new BigNumber(0)

  const depositMint = realm?.account.communityMint
  const tokenName =
    getMintMetadata(depositMint)?.name ?? realm?.account.name ?? ''

  const amount = ownVoterWeight
    ? getNumTokens(ownVoterWeight, ownTokenRecord, mint, realmInfo)
    : new BigNumber(0)
  const max =
    realm && proposal && mint
      ? new BigNumber(
          calculateMaxVoteScore(realm, proposal, mint).toString()
        ).shiftedBy(-mint.decimals)
      : null

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
          You do not have any voting power in this dao.
        </div>
      ) : (
        <div className={'p-3 rounded-md bg-bkg-1'}>
          <div className="text-white/50 text-xs">{tokenName} Votes</div>
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
