import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import classNames from 'classnames'

import useRealm from '@hooks/useRealm'

import { useTokenOwnerRecordsDelegatedToUser } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useConnection } from '@solana/wallet-adapter-react'
import { getVanillaGovpower } from '@hooks/queries/governancePower'
import {
  useAddressQuery_CommunityTokenOwner,
  useAddressQuery_CouncilTokenOwner,
} from '@hooks/queries/addresses/tokenOwnerRecord'
import { useAsync } from 'react-async-hook'
import BN from 'bn.js'
import { Deposit } from './Deposit'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import VotingPowerPct from '@components/ProposalVotingPower/VotingPowerPct'

interface Props {
  className?: string
  role: 'community' | 'council'
}

export default function VanillaVotingPower({ role, ...props }: Props) {
  const realm = useRealmQuery().data?.result
  const { realmInfo } = useRealm()

  const { data: communityTOR } = useAddressQuery_CommunityTokenOwner()
  const { data: councilTOR } = useAddressQuery_CouncilTokenOwner()

  const { connection } = useConnection()

  const relevantTOR = role === 'community' ? communityTOR : councilTOR
  const relevantMint =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const mintInfo = useMintInfoByPubkeyQuery(relevantMint).data?.result

  const { result: personalAmount } = useAsync(
    async () => relevantTOR && getVanillaGovpower(connection, relevantTOR),
    [connection, relevantTOR]
  )

  const torsDelegatedToUser = useTokenOwnerRecordsDelegatedToUser()

  const { result: delegatorsAmount } = useAsync(
    async () =>
      torsDelegatedToUser === undefined || relevantMint === undefined
        ? undefined
        : (
            await Promise.all(
              torsDelegatedToUser
                .filter((x) =>
                  x.account.governingTokenMint.equals(relevantMint)
                )
                .map((x) => getVanillaGovpower(connection, x.pubkey))
            )
          ).reduce((partialSum, a) => partialSum.add(a), new BN(0)),
    [connection, relevantMint, torsDelegatedToUser]
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

  const tokenName =
    getMintMetadata(relevantMint)?.name ?? realm?.account.name ?? ''

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
        <div className={'text-xs text-fgd-3'}>
          You do not have any voting power in this dao.
        </div>
      ) : (
        <div className={'p-3 rounded-md bg-bkg-1'}>
          <div className="text-fgd-3 text-xs">{tokenName} Votes</div>
          <div className="flex items-center justify-between mt-1">
            <div className=" flex flex-row gap-x-2">
              <div className="text-xl font-bold text-fgd-1 hero-text">
                {formattedTotal}
              </div>
              <div className="text-xs text-fgd-3">
                ({formattedDelegatorsAmount} from delegators)
              </div>
            </div>

            {mintInfo && (
              <VotingPowerPct
                amount={new BigNumber(totalAmount.toString())}
                total={new BigNumber(mintInfo.supply.toString())}
              />
            )}
          </div>
        </div>
      )}
      <Deposit role={role} />
    </div>
  )
}
