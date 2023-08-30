import React, { useCallback } from 'react'
import Button from '@components/Button'
import useRealm from '@hooks/useRealm'
import {
  fmtMintAmount,
  getMintDecimalAmountFromNatural,
} from '@tools/sdk/units'
import { useEffect, useMemo, useState } from 'react'
import LockTokensModal from './LockTokensModal'
import DepositCommunityTokensBtn from '../TokenBalance/DepositCommunityTokensBtn'
import WithDrawCommunityTokens from '../TokenBalance/WithdrawCommunityTokensBtn'
import DepositCard from './DepositCard'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import VotingPowerBox from '../TokenBalance/VotingPowerBox'
import { PublicKey } from '@solana/web3.js'
import { MintInfo } from '@solana/spl-token'
import { BN } from '@coral-xyz/anchor'
import tokenPriceService from '@utils/services/tokenPrice'
import { getDeposits } from 'VoteStakeRegistry/tools/deposits'
import { DepositWithMintAccount } from 'VoteStakeRegistry/sdk/accounts'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import { notify } from '@utils/notifications'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import {
  getTokenOwnerRecordAddress,
  GoverningTokenRole,
} from '@solana/spl-governance'
import InlineNotification from '@components/InlineNotification'
import {
  LightningBoltIcon,
  LinkIcon,
  LockClosedIcon,
} from '@heroicons/react/outline'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { abbreviateAddress } from '@utils/formatting'
import { TokenDeposit } from '@components/TokenBalance/TokenBalanceCard'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useTokenOwnerRecordByPubkeyQuery } from '@hooks/queries/tokenOwnerRecord'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import { useConnection } from '@solana/wallet-adapter-react'
import { useVsrGovpower } from '@hooks/queries/plugins/vsr'

interface DepositBox {
  mintPk: PublicKey
  mint: MintInfo
  currentAmount: BN
  lockUpKind: string
}
const unlockedTypes = ['none']

const LockTokensAccount: React.FC<{
  tokenOwnerRecordPk: PublicKey
  children: React.ReactNode
}> = ({ tokenOwnerRecordPk, children }) => {
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const { realmInfo } = useRealm()
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const registrar = useVotePluginsClientStore(
    (s) => s.state.voteStakeRegistryRegistrar
  )
  const isZeroMultiplierConfig = !registrar?.votingMints.filter(
    (x) => !x.maxExtraLockupVoteWeightScaledFactor.isZero()
  ).length

  const [reducedDeposits, setReducedDeposits] = useState<DepositBox[]>([])
  const ownDeposits = useDepositStore((s) => s.state.deposits)
  const [deposits, setDeposits] = useState<DepositWithMintAccount[]>([])
  const votingPower = useVsrGovpower().result?.result ?? new BN(0)
  const [votingPowerFromDeposits, setVotingPowerFromDeposits] = useState<BN>(
    new BN(0)
  )
  const [isOwnerOfDeposits, setIsOwnerOfDeposits] = useState(true)

  const { data: tokenOwnerRecord } = useTokenOwnerRecordByPubkeyQuery(
    tokenOwnerRecordPk
  )
  const tokenOwnerRecordWalletPk =
    tokenOwnerRecord?.result?.account.governingTokenOwner

  const [isLoading, setIsLoading] = useState(false)
  const { connection } = useConnection()
  const wallet = useWalletOnePointOh()
  const publicKey = wallet?.publicKey ?? null
  const connected = wallet?.connected
  const mainBoxesClasses = 'bg-bkg-1 col-span-1 p-4 rounded-md'
  const isNextSameRecord = (x, next) => {
    const nextType = Object.keys(next.lockup.kind)[0]
    return (
      x.mintPk.toBase58() === next.mint.publicKey.toBase58() &&
      ((!unlockedTypes.includes(x.lockUpKind) &&
        !unlockedTypes.includes(nextType)) ||
        (unlockedTypes.includes(x.lockUpKind) &&
          unlockedTypes.includes(nextType)))
    )
  }
  const handleGetDeposits = useCallback(async () => {
    setIsLoading(true)
    try {
      if (
        config?.account.communityTokenConfig.voterWeightAddin &&
        realm?.pubkey &&
        publicKey &&
        client
      ) {
        const { deposits, votingPowerFromDeposits } = await getDeposits({
          realmPk: realm.pubkey,
          communityMintPk: realm.account.communityMint,
          walletPk: tokenOwnerRecordWalletPk
            ? new PublicKey(tokenOwnerRecordWalletPk)
            : publicKey,
          client: client,
          connection: connection,
        })
        const reducedDeposits = deposits.reduce((curr, next) => {
          const nextType = Object.keys(next.lockup.kind)[0]
          const isUnlockedType = unlockedTypes.includes(nextType)
          const currentValue = curr.find((x) => {
            return isNextSameRecord(x, next)
          })
          if (typeof currentValue === 'undefined') {
            curr.push({
              mintPk: next.mint.publicKey,
              mint: next.mint.account,
              currentAmount: isUnlockedType
                ? next.available
                : next.currentlyLocked,
              lockUpKind: nextType,
            })
          } else {
            curr.map((x) => {
              if (isNextSameRecord(x, next)) {
                x.currentAmount = x.currentAmount.add(
                  unlockedTypes.includes(x.lockUpKind)
                    ? next.available
                    : next.currentlyLocked
                )
              }
              return x
            })
          }
          return curr
        }, [] as DepositBox[])
        setVotingPowerFromDeposits(votingPowerFromDeposits)
        setDeposits(deposits)
        setReducedDeposits(reducedDeposits)
      } else if (!wallet?.connected) {
        setVotingPowerFromDeposits(new BN(0))
        setDeposits([])
        setReducedDeposits([])
      }
    } catch (e) {
      console.log(e)
      notify({
        type: 'error',
        message: "Can't fetch deposits",
      })
    }
    setIsLoading(false)
  }, [
    client,
    config?.account.communityTokenConfig.voterWeightAddin,
    connection,
    publicKey,
    realm?.account.communityMint,
    realm?.pubkey,
    tokenOwnerRecordWalletPk,
    wallet?.connected,
  ])

  useEffect(() => {
    handleGetDeposits()
  }, [
    isOwnerOfDeposits,
    client,
    handleGetDeposits,
    ownDeposits, //side effect
  ])

  const depositMint =
    !mint?.supply.isZero() ||
    config?.account.communityTokenConfig.maxVoterWeightAddin
      ? realm?.account.communityMint
      : !councilMint?.supply.isZero()
      ? realm?.account.config.councilMint
      : undefined

  useEffect(() => {
    if (realm?.owner && realm.pubkey && publicKey !== null && depositMint) {
      const getTokenOwnerRecord = async () => {
        const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
          realm.owner,
          realm.pubkey,
          depositMint,
          publicKey
        )
        setIsOwnerOfDeposits(tokenOwnerRecordAddress.equals(tokenOwnerRecordPk))
      }
      getTokenOwnerRecord()
    }
  }, [tokenOwnerRecordPk, depositMint, realm, publicKey])

  const hasLockedTokens = useMemo(() => {
    return reducedDeposits.find((d) => d.lockUpKind !== 'none')
  }, [reducedDeposits])

  const lockedTokens = useMemo(() => {
    return (
      deposits
        // we filter out one deposits that is used to store none locked community tokens
        ?.filter(
          (x) =>
            x.index !==
            deposits.find(
              (depo) =>
                typeof depo.lockup.kind.none !== 'undefined' &&
                depo.mint.publicKey.toBase58() ===
                  realm?.account.communityMint.toBase58() &&
                depo.isUsed &&
                !depo.allowClawback &&
                depo.isUsed
            )?.index
        )
    )
  }, [deposits, realm?.account.communityMint])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12">
        <div className="mb-4">
          <PreviousRouteBtn />
        </div>
        <div className="flex items-center justify-between mb-4">
          {realmInfo?.ogImage && (
            <img
              src={realmInfo?.ogImage}
              className="mr-2 rouninded-full w-8 h-8"
            />
          )}
          <h1 className="leading-none flex flex-col mb-0">
            <span className="font-normal text-fgd-2 text-xs mb-2">
              {realmInfo?.displayName}
            </span>
            My governance power{' '}
          </h1>

          <div className="ml-auto flex flex-row">
            <DepositCommunityTokensBtn
              inAccountDetails={true}
              className="mr-3"
            />
            <WithDrawCommunityTokens />
          </div>
        </div>
        {!isOwnerOfDeposits && connected && (
          <div className="pb-6">
            <InlineNotification
              desc="You do not own this account"
              type="info"
            />
          </div>
        )}
        {connected ? (
          <div>
            <div className="grid md:grid-cols-3 grid-flow-row gap-4 pb-8">
              {isLoading ? (
                <>
                  <div className="animate-pulse bg-bkg-3 col-span-1 h-44 rounded-md" />
                  <div className="animate-pulse bg-bkg-3 col-span-1 h-44 rounded-md" />
                  <div className="animate-pulse bg-bkg-3 col-span-1 h-44 rounded-md" />
                </>
              ) : (
                <>
                  <div className="col-span-1">
                    {mint && (
                      <VotingPowerBox
                        votingPower={votingPower}
                        mint={mint}
                        votingPowerFromDeposits={votingPowerFromDeposits}
                        className={mainBoxesClasses}
                      />
                    )}
                  </div>
                  {reducedDeposits?.map((x, idx) => {
                    const availableTokens = fmtMintAmount(
                      x.mint,
                      x.currentAmount
                    )
                    const price =
                      getMintDecimalAmountFromNatural(
                        x.mint,
                        x.currentAmount
                      ).toNumber() *
                      tokenPriceService.getUSDTokenPrice(x.mintPk.toBase58())
                    const tokenName =
                      getMintMetadata(x.mintPk)?.name ||
                      tokenPriceService.getTokenInfo(x.mintPk.toBase58())
                        ?.name ||
                      abbreviateAddress(x.mintPk)
                    const formatter = Intl.NumberFormat('en', {
                      notation: 'compact',
                    })
                    return (
                      <div key={idx} className={mainBoxesClasses}>
                        <p className="text-fgd-3">
                          {`${tokenName} ${
                            x.lockUpKind === 'none' ? 'Deposited' : 'Locked'
                          }`}
                        </p>
                        <span className="hero-text">
                          {availableTokens}
                          {price ? (
                            <span className="font-normal text-xs ml-2">
                              <span className="text-fgd-3">≈</span>$
                              {formatter.format(price)}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    )
                  })}
                  {reducedDeposits.length === 0 ? (
                    <div className={mainBoxesClasses}>
                      <p className="text-fgd-3">{`${realmInfo?.symbol} Deposited`}</p>
                      <span className="hero-text">0</span>
                    </div>
                  ) : null}
                  {!hasLockedTokens ? (
                    <div className={mainBoxesClasses}>
                      <p className="text-fgd-3">{`${realmInfo?.symbol} Locked`}</p>
                      <span className="hero-text">0</span>
                    </div>
                  ) : null}
                </>
              )}
            </div>
            <h2 className="mb-4">Locked Deposits</h2>
            {lockedTokens?.length > 0 ? (
              <div
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 ${
                  !isOwnerOfDeposits ? 'opacity-0.8 pointer-events-none' : ''
                }`}
              >
                {deposits
                  //we filter out one deposits that is used to store none locked community tokens
                  ?.filter(
                    (x) =>
                      x.index !==
                      deposits.find(
                        (depo) =>
                          typeof depo.lockup.kind.none !== 'undefined' &&
                          depo.mint.publicKey.toBase58() ===
                            realm?.account.communityMint.toBase58() &&
                          depo.isUsed &&
                          !depo.allowClawback &&
                          depo.isUsed
                      )?.index
                  )
                  ?.map((x, idx) => (
                    <DepositCard deposit={x} key={idx}></DepositCard>
                  ))}
                {!isZeroMultiplierConfig && (
                  <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg">
                    <LightningBoltIcon className="h-8 mb-2 text-primary-light w-8" />
                    <p className="flex text-center pb-6">
                      Increase your voting power by<br></br> locking your
                      tokens.
                    </p>
                    <Button onClick={() => setIsLockModalOpen(true)}>
                      <div className="flex items-center">
                        <LockClosedIcon className="h-5 mr-1.5 w-5" />
                        <span>Lock Tokens</span>
                      </div>
                    </Button>
                  </div>
                )}
              </div>
            ) : !isZeroMultiplierConfig ? (
              <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg mb-3">
                <LightningBoltIcon className="h-8 mb-2 text-primary-light w-8" />
                <p className="flex text-center pb-6">
                  Increase your voting power by<br></br> locking your tokens.
                </p>
                <Button onClick={() => setIsLockModalOpen(true)}>
                  <div className="flex items-center">
                    <LockClosedIcon className="h-5 mr-1.5 w-5" />
                    <span>Lock Tokens</span>
                  </div>
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg">
            <LinkIcon className="h-6 mb-1 text-primary-light w-6" />
            <span className="text-fgd-1 text-sm">Connect your wallet</span>
          </div>
        )}
        {isLockModalOpen && (
          <LockTokensModal
            isOpen={isLockModalOpen}
            onClose={() => setIsLockModalOpen(false)}
          ></LockTokensModal>
        )}
        <div className="mt-4">
          <TokenDeposit
            mint={councilMint}
            tokenRole={GoverningTokenRole.Council}
            councilVote={true}
            inAccountDetails={true}
          />
        </div>
      </div>
      {connected && children}
    </div>
  )
}

export default LockTokensAccount
