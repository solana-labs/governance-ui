import { BigNumber } from 'bignumber.js'
import { useCallback } from 'react'

import useRealm from '@hooks/useRealm'
import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'
import useProposal from '@hooks/useProposal'
import useWalletStore from 'stores/useWalletStore'
import { SecondaryButton } from '@components/Button'

import { getMintMetadata } from '../instructions/programs/splToken'
import getNumTokens from './getNumTokens'
import depositTokens from './depositTokens'
import VotingPowerPct from './VotingPowerPct'

interface Props {
  className?: string
}

export default function CommunityVotingPower(props: Props) {
  const {
    mint,
    ownTokenRecord,
    ownVoterWeight,
    realm,
    realmInfo,
    realmTokenAccount,
  } = useRealm()
  const { proposal } = useProposal()
  const fetchWalletTokenAccounts = useWalletStore(
    (s) => s.actions.fetchWalletTokenAccounts
  )
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm)
  const connection = useWalletStore((s) => s.connection.current)
  const wallet = useWalletStore((s) => s.current)

  const depositAmount = realmTokenAccount
    ? new BigNumber(realmTokenAccount.account.amount.toString())
    : new BigNumber(0)
  const depositMint = realm?.account.communityMint
  const tokenName =
    getMintMetadata(depositMint)?.name ?? realm?.account.name ?? ''

  const amount = getNumTokens(ownVoterWeight, ownTokenRecord, mint, realmInfo)
  const max =
    realm && proposal && mint
      ? new BigNumber(calculateMaxVoteScore(realm, proposal, mint).toString())
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
      await fetchWalletTokenAccounts()
      await fetchRealm(realmInfo.programId, realmInfo.realmId)
    }
  }, [
    depositAmount,
    fetchRealm,
    fetchWalletTokenAccounts,
    connection,
    realmTokenAccount,
    realmInfo,
    realm,
    wallet,
  ])

  return (
    <div className={props.className}>
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
      {depositAmount.isGreaterThan(0) && (
        <>
          <div className="mt-3 text-xs text-white/50">
            You have {depositAmount.toString()} more {tokenName} votes in your
            wallet. Do you want to deposit them to increase your voting power in
            this Realm?
          </div>
          <SecondaryButton className="mt-4 w-48" onClick={deposit}>
            Deposit
          </SecondaryButton>
        </>
      )}
    </div>
  )
}
