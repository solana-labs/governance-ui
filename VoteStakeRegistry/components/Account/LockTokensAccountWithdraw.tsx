import Button from '@components/Button'
import useRealm from '@hooks/useRealm'
import {
  fmtMintAmount,
  getMintDecimalAmountFromNatural,
} from '@tools/sdk/units'
import { useCallback, useEffect, useMemo, useState } from 'react'
import LockTokensModal from './LockTokensModal'
import DepositCard from './DepositCard'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import VotingPowerBox from '../TokenBalance/VotingPowerBox'
import { PublicKey } from '@solana/web3.js'
import { MintInfo } from '@solana/spl-token'
import { AnchorProvider, BN, Wallet } from '@coral-xyz/anchor'
import tokenPriceService from '@utils/services/tokenPrice'
import { getDeposits } from 'VoteStakeRegistry/tools/deposits'
import { DepositWithMintAccount } from 'VoteStakeRegistry/sdk/accounts'
import { notify } from '@utils/notifications'
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
import Account from '../../../components/Account'
import { abbreviateAddress } from '@utils/formatting'
import { TokenDeposit } from '@components/TokenBalance/TokenBalanceCard'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useTokenOwnerRecordByPubkeyQuery } from '@hooks/queries/tokenOwnerRecord'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import { useConnection } from '@solana/wallet-adapter-react'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { useVsrGovpower } from '@hooks/queries/plugins/vsr'

interface DepositBox {
  mintPk: PublicKey
  mint: MintInfo
  currentAmount: BN
  lockUpKind: string
}
const unlockedTypes: string[] = []

const LockTokensAccount = ({ tokenOwnerRecordPk }) => {
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const { realmInfo } = useRealm()
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [client, setClient] = useState<VsrClient | undefined>(undefined)
  const [reducedDeposits, setReducedDeposits] = useState<DepositBox[]>([])
  const [ownDeposits, setOwnDeposits] = useState<DepositWithMintAccount[]>([])
  const [deposits, setDeposits] = useState<DepositWithMintAccount[]>([])
  const votingPower = useVsrGovpower().result?.result ?? new BN(0)
  const [votingPowerFromDeposits, setVotingPowerFromDeposits] = useState<BN>(
    new BN(0)
  )
  const [isOwnerOfDeposits, setIsOwnerOfDeposits] = useState(true)

  const lol = useMemo(() => new PublicKey(tokenOwnerRecordPk), [
    tokenOwnerRecordPk,
  ])
  const { data: tokenOwnerRecord } = useTokenOwnerRecordByPubkeyQuery(lol)

  const tokenOwnerRecordWalletPk =
    tokenOwnerRecord?.result?.account.governingTokenOwner
  const [isLoading, setIsLoading] = useState(false)
  const { connection } = useConnection()
  const connnectionContext = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
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

  const handleSetVsrClient = useCallback(
    async (wallet, connection, programId) => {
      const options = AnchorProvider.defaultOptions()
      const provider = new AnchorProvider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )
      const vsrClient = await VsrClient.connect(
        provider,
        programId,
        connection.cluster === 'devnet'
      )
      const ownDeposits = await getOwnedDeposits({
        realmPk: realm!.pubkey,
        communityMintPk: realm!.account.communityMint,
        walletPk: new PublicKey(tokenOwnerRecordWalletPk!),
        client: vsrClient!,
        connection: connection.current,
      })
      setClient(vsrClient)
      setOwnDeposits(ownDeposits)
    },
    [realm, tokenOwnerRecordWalletPk]
  )

  const getOwnedDeposits = async ({
    isUsed = true,
    realmPk,
    walletPk,
    communityMintPk,
    client,
    connection,
  }) => {
    const { deposits } = await getDeposits({
      isUsed,
      realmPk,
      walletPk,
      communityMintPk,
      client,
      connection,
    })
    return deposits
  }
  const handleGetDeposits = useCallback(async () => {
    setIsLoading(true)
    try {
      if (realm!.pubkey && wallet?.publicKey && client) {
        const { deposits, votingPowerFromDeposits } = await getDeposits({
          realmPk: realm!.pubkey,
          communityMintPk: realm!.account.communityMint,
          walletPk: tokenOwnerRecordWalletPk
            ? new PublicKey(tokenOwnerRecordWalletPk)
            : wallet.publicKey,
          client: client!,
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
    connection,
    realm,
    tokenOwnerRecordWalletPk,
    wallet?.connected,
    wallet?.publicKey,
  ])

  const areLoadedDepositsSameAsOwned =
    JSON.stringify(ownDeposits) === JSON.stringify(deposits)
  useEffect(() => {
    if (!areLoadedDepositsSameAsOwned && isOwnerOfDeposits) {
      handleGetDeposits()
    }
  }, [areLoadedDepositsSameAsOwned, isOwnerOfDeposits, handleGetDeposits])
  useEffect(() => {
    handleGetDeposits()
  }, [isOwnerOfDeposits, client, handleGetDeposits])

  useEffect(() => {
    if (
      wallet?.publicKey?.toBase58() &&
      connnectionContext &&
      realm?.pubkey.toBase58()
    ) {
      handleSetVsrClient(
        wallet,
        connnectionContext,
        new PublicKey('4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo')
      )
    }
  }, [connnectionContext, handleSetVsrClient, realm?.pubkey, wallet])

  const defaultMintOwnerRecordMint =
    !mint?.supply.isZero() ||
    config?.account.communityTokenConfig.maxVoterWeightAddin
      ? realm?.account.communityMint
      : !councilMint?.supply.isZero()
      ? realm?.account.config.councilMint
      : undefined

  useEffect(() => {
    const walletPubkey = wallet?.publicKey
    if (
      realm?.owner &&
      walletPubkey &&
      walletPubkey !== null &&
      realm.pubkey &&
      defaultMintOwnerRecordMint
    ) {
      const getTokenOwnerRecord = async () => {
        const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
          realm.owner,
          realm.pubkey,
          defaultMintOwnerRecordMint,
          walletPubkey
        )
        setIsOwnerOfDeposits(
          tokenOwnerRecordAddress.toBase58() === tokenOwnerRecordPk
        )
      }
      getTokenOwnerRecord()
    }
  }, [
    defaultMintOwnerRecordMint,
    realm?.owner,
    realm?.pubkey,
    tokenOwnerRecordPk,
    wallet?.publicKey,
  ])

  const hasLockedTokens = useMemo(() => {
    return reducedDeposits.find((d) => d.lockUpKind !== 'none')
  }, [reducedDeposits])

  const lockedTokens = useMemo(() => {
    return deposits
  }, [deposits])

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

          <div className="ml-auto flex flex-row"></div>
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
                  ?.map((x, idx) => (
                    <DepositCard
                      deposit={x}
                      key={idx}
                      vsrClient={client}
                    ></DepositCard>
                  ))}
                <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg">
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
              </div>
            ) : (
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
            )}
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
      {connected && <Account withHeader={false} displayPanel={false}></Account>}
    </div>
  )
}

export default LockTokensAccount
