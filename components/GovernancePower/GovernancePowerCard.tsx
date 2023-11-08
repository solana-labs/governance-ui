import { ChevronRightIcon } from '@heroicons/react/solid'
import {
  determineVotingPowerType,
  useGovernancePowerAsync,
} from '@hooks/queries/governancePower'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import useQueryContext from '@hooks/useQueryContext'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { GoverningTokenType } from '@solana/spl-governance'
import { useConnection } from '@solana/wallet-adapter-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAsync } from 'react-async-hook'
import GovernancePowerForRole from './GovernancePowerForRole'
import { Deposit } from './Vanilla/Deposit'

const GovernancePowerTitle = () => {
  const { symbol } = useRouter().query
  const { fmtUrlWithCluster } = useQueryContext()
  const connected = useWalletOnePointOh()?.connected ?? undefined

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="mb-0">My governance power</h3>
      <Link href={fmtUrlWithCluster(`/dao/${symbol}/account/me`)}>
        <a
          className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3 ${
            !connected ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          View
          <ChevronRightIcon className="flex-shrink-0 w-6 h-6" />
        </a>
      </Link>
    </div>
  )
}

// TODO: refactor deposit components to their own generic DepositForRole component
const VanillaDeposit = ({ role }: { role: 'community' | 'council' }) => {
  const { connection } = useConnection()

  const realmPk = useSelectedRealmPubkey()

  const { result: kind } = useAsync(async () => {
    if (realmPk === undefined) return undefined
    return determineVotingPowerType(connection, realmPk, role)
  }, [connection, realmPk, role])

  return kind === 'vanilla' ? <Deposit role={role} /> : <></>
}

const GovernancePowerCard = () => {
  const connected = useWalletOnePointOh()?.connected ?? false

  const communityPower = useGovernancePowerAsync('community')
  const councilPower = useGovernancePowerAsync('council')

  const bothLoading = communityPower.loading && councilPower.loading

  const bothZero =
    communityPower.result !== undefined &&
    councilPower.result !== undefined &&
    communityPower.result.isZero() &&
    councilPower.result.isZero()

  const realmConfig = useRealmConfigQuery().data?.result

  return (
    <div>
      <GovernancePowerTitle />
      {!connected ? (
        <div className={'text-xs text-white/50 mt-8'}>
          Connect your wallet to see governance power
        </div>
      ) : bothLoading ? (
        <>
          <div className="h-12 mb-4 rounded-lg animate-pulse bg-bkg-3" />
          <div className="h-10 rounded-lg animate-pulse bg-bkg-3" />
        </>
      ) : bothZero ? (
        <div className={'text-xs text-white/50 mt-8'}>
          You do not have any governance power in this dao
          <div className="flex flex-col">
            <VanillaDeposit role="community" />
            <VanillaDeposit role="council" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {realmConfig?.account.communityTokenConfig.tokenType ===
          GoverningTokenType.Dormant ? null : (
            <GovernancePowerForRole role="community" />
          )}
          {realmConfig?.account.councilTokenConfig.tokenType ===
          GoverningTokenType.Dormant ? null : (
            <GovernancePowerForRole
              role="council"
              hideIfZero={
                realmConfig?.account.communityTokenConfig.tokenType !==
                GoverningTokenType.Dormant
              }
            />
          )}
        </div>
      )}
    </div>
  )
}

export default GovernancePowerCard
