import classNames from 'classnames'

import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { useRealmQuery } from '@hooks/queries/realm'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwnerRecord'
import { useEffect, useMemo } from 'react'
import { getVanillaGovpower } from '@hooks/queries/governancePower'
import clsx from 'clsx'
import { useConnection } from '@solana/wallet-adapter-react'
import { BigNumber } from 'bignumber.js'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { TokenDeposit } from '@components/TokenBalance/TokenDeposit'
import { GoverningTokenRole } from '@solana/spl-governance'
import { useQuadraticVotingPlugin } from 'plugin-library/useQuadraticVotingPlugin'

interface Props {
  className?: string
}

export default function QVVotingPower(props: Props) {
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result

  //TODO figure out the correct way to get params
  const { setVotingPower, pluginData } = useQuadraticVotingPlugin(
    null,
    null,
    null
  )
  // const quadraticVotingPower = useQuadraticPluginStore((s) => s.state.votingPower)
  // const setQuadraticVotingPower = useQuadraticPluginStore((s) => s.setVotingPower)

  const communityTOR = useAddressQuery_CommunityTokenOwner()
  const { data: TOR } = communityTOR

  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result

  useEffect(() => {
    if (realm && TOR && mintInfo) {
      getVanillaGovpower(connection, TOR).then(setVotingPower)
    }
  }, [realm, TOR])

  const votingPower = pluginData?.votingPower

  const isLoading = useDepositStore((s) => s.state.isLoading)

  const formattedTotal = useMemo(
    () =>
      mintInfo && votingPower !== undefined
        ? new BigNumber(votingPower.toString())
            .shiftedBy(-mintInfo.decimals)
            .toString()
        : undefined,
    [votingPower, mintInfo]
  )

  if (isLoading || !votingPower) {
    return (
      <div
        className={classNames(
          props.className,
          'rounded-md bg-bkg-1 h-[76px] animate-pulse'
        )}
      />
    )
  }

  return (
    <div className={clsx(props.className)}>
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="flex items-center justify-between mt-1">
          <div className=" flex flex-col gap-x-2">
            <div
              className={clsx(
                props.className,
                votingPower.isZero() && 'hidden'
              )}
            >
              <div className={'p-3 rounded-md bg-bkg-1'}>
                <div className="text-fgd-3 text-xs">QV Votes</div>
                <div className="flex items-center justify-between mt-1">
                  <div className=" flex flex-row gap-x-2">
                    <div className="text-xl font-bold text-fgd-1 hero-text">
                      {formattedTotal ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-fgd-1 hero-text">
              <TokenDeposit
                mint={mintInfo}
                tokenRole={GoverningTokenRole.Community}
                councilVote={false}
                inAccountDetails={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
