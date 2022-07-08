import classNames from 'classnames'
import useRealm from '@hooks/useRealm'
import { BigNumber } from 'bignumber.js'

import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'
import useProposal from '@hooks/useProposal'

import { getMintMetadata } from '../instructions/programs/splToken'
import getNumTokens from './getNumTokens'

interface Props {
  className?: string
}

export default function CouncilVotingPower(props: Props) {
  const {
    councilMint,
    ownCouncilTokenRecord,
    ownVoterWeight,
    realm,
    realmInfo,
  } = useRealm()
  const { proposal } = useProposal()

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
        )
      : null

  return (
    <div
      className={classNames(props.className, 'p-3', 'rounded-md', 'bg-bkg-1')}
    >
      <div className="text-white/50 text-xs">{tokenName} Council Votes</div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-white font-bold text-2xl">{amount.toFormat()}</div>
        {max && !max.isZero() && (
          <div className="text-[11px] leading-[15px] text-white/70 text-right">
            {amount.shiftedBy(2).dividedBy(max).toFixed(2)}% of total
            <br />
            voting power
          </div>
        )}
      </div>
    </div>
  )
}
