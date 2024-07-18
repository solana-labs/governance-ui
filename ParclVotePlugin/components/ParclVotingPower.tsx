import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useRealmQuery } from '@hooks/queries/realm'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useConnection } from '@solana/wallet-adapter-react'
import { getParclGovPower } from '@hooks/queries/governancePower'
import { useAsync } from 'react-async-hook'
import BN from 'bn.js'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import VotingPowerPct from '@components/ProposalVotingPower/VotingPowerPct'
import clsx from 'clsx'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { GoverningTokenType } from '@solana/spl-governance'
import useParclScalingFactor from '@hooks/parcl/useScalingFactor'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserTokenAccountsQuery } from '@hooks/queries/tokenAccount'

interface Props {
  className?: string
  role: 'community' | 'council'
  hideIfZero?: boolean
  children?: React.ReactNode
}

export default function ParclVotingPower({
  role,
  hideIfZero,
  children,
  ...props
}: Props) {
  const realm = useRealmQuery().data?.result
  const realmConfig = useRealmConfigQuery().data?.result
  const { data: tokenAccounts } = useUserTokenAccountsQuery()
  const wallet = useWalletOnePointOh()

  const { connection } = useConnection()

  const relevantMint =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const mintInfo = useMintInfoByPubkeyQuery(relevantMint).data?.result

  const { result: personalAmount } = useAsync(
    async () =>
      wallet?.publicKey && role === 'community'
         ? getParclGovPower(connection, wallet.publicKey)
         : tokenAccounts?.find(
              (a) => relevantMint && a.account.mint.equals(relevantMint)
           )?.account.amount as BN,
    [connection, wallet, role, relevantMint, tokenAccounts]
  )

  const parclScalingFactor = useParclScalingFactor() ?? 1;

  const totalAmount = personalAmount ?? new BN(0)

  const formattedTotal = useMemo(
    () =>
      mintInfo && totalAmount !== undefined
        ? new BigNumber(totalAmount.toString())
            .multipliedBy(
              role === 'community' 
              ? parclScalingFactor
              : 1
            )
            .shiftedBy(-mintInfo.decimals)
            .integerValue()
            .toString()
        : undefined,
    [totalAmount, mintInfo]
  )

  const tokenName =
    getMintMetadata(relevantMint)?.name ?? realm?.account.name ?? ''

  const disabled =
      realmConfig?.account.councilTokenConfig.tokenType ===
        GoverningTokenType.Dormant

  return (
    <div
      className={clsx(
        props.className,
        hideIfZero && totalAmount.isZero() && 'hidden',
        disabled && 'hidden'
      )}
    >
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="text-fgd-3 text-xs">
          {tokenName}
          {role === 'council' ? ' Council' : ''} Votes
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className=" flex flex-row gap-x-2">
            <div className="text-xl font-bold text-fgd-1 hero-text">
              {formattedTotal ?? 0}
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
      {children}
    </div>
  )
}
