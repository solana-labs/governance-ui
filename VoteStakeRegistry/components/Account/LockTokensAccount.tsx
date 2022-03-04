import Button from '@components/Button'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import useRealm from '@hooks/useRealm'
import {
  fmtMintAmount,
  getMintDecimalAmountFromNatural,
} from '@tools/sdk/units'
import { useEffect, useState } from 'react'
import LockTokensModal from './LockTokensModal'
import DepositCommunityTokensBtn from '../TokenBalance/DepositCommunityTokensBtn'
import WithDrawCommunityTokens from '../TokenBalance/WithdrawCommunityTokensBtn'
import DepositCard from './DepositCard'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import VotingPowerBox from '../TokenBalance/VotingPowerBox'
import { PublicKey } from '@solana/web3.js'
import { MintInfo } from '@solana/spl-token'
import { BN } from '@project-serum/anchor'
import tokenService from '@utils/services/token'
import useWalletStore from 'stores/useWalletStore'
import { getDeposits } from 'VoteStakeRegistry/tools/deposits'
import { DepositWithMintAccount } from 'VoteStakeRegistry/sdk/accounts'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import { notify } from '@utils/notifications'
import Loading from '@components/Loading'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'
import { getTokenOwnerRecordAddress } from '@solana/spl-governance'
interface DepositBox {
  mintPk: PublicKey
  mint: MintInfo
  currentAmount: BN
  lockUpKind: string
}
const unlockedTypes = ['none']

const LockTokensAccount = ({ tokenOwnerRecordPk }) => {
  const { realm, mint, tokenRecords, councilMint } = useRealm()
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
  const [reducedDeposits, setReducedDeposits] = useState<DepositBox[]>([])
  const ownDeposits = useDepositStore((s) => s.state.deposits)
  const [deposits, setDeposits] = useState<DepositWithMintAccount[]>([])
  const [votingPower, setVotingPower] = useState<BN>(new BN(0))
  const [votingPowerFromDeposits, setVotingPowerFromDeposits] = useState<BN>(
    new BN(0)
  )
  const [isOwnerOfDeposits, setIsOwnerOfDeposits] = useState(true)
  const tokenOwnerRecordWalletPk = Object.keys(tokenRecords)?.find(
    (key) => tokenRecords[key]?.pubkey?.toBase58() === tokenOwnerRecordPk
  )
  const [isLoading, setIsLoading] = useState(false)
  const connection = useWalletStore((s) => s.connection.current)
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const mainBoxesClasses =
    'bg-bkg-1 px-4 py-4 flex flex-col mr-3 mb-3'
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
  const handleGetDeposits = async () => {
    setIsLoading(true)
    try {
      if (
        realm?.account.config.useCommunityVoterWeightAddin &&
        realm.pubkey &&
        wallet?.publicKey &&
        client
      ) {
        const {
          deposits,
          votingPower,
          votingPowerFromDeposits,
        } = await getDeposits({
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
        setVotingPower(votingPower)
        setDeposits(deposits)
        setReducedDeposits(reducedDeposits)
      } else if (!wallet?.connected) {
        setVotingPowerFromDeposits(new BN(0))
        setVotingPower(new BN(0))
        setDeposits([])
        setReducedDeposits([])
      }
    } catch (e) {
      notify({
        type: 'error',
        message: "Can't fetch deposits",
      })
    }
    setIsLoading(false)
  }
  useEffect(() => {
    if (
      JSON.stringify(ownDeposits) !== JSON.stringify(deposits) &&
      isOwnerOfDeposits
    ) {
      handleGetDeposits()
    }
  }, [JSON.stringify(ownDeposits), ownDeposits.length])
  useEffect(() => {
    handleGetDeposits()
  }, [isOwnerOfDeposits, client])
  useEffect(() => {
    const getTokenOwnerRecord = async () => {
      const defaultMint = !mint?.supply.isZero()
        ? realm!.account.communityMint
        : !councilMint?.supply.isZero()
        ? realm!.account.config.councilMint
        : undefined
      const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
        realm!.owner,
        realm!.pubkey,
        defaultMint!,
        wallet!.publicKey!
      )
      setIsOwnerOfDeposits(
        tokenOwnerRecordAddress.toBase58() === tokenOwnerRecordPk
      )
    }
    if (realm && wallet?.connected) {
      getTokenOwnerRecord()
    }
  }, [realm?.pubkey.toBase58(), wallet?.connected, tokenOwnerRecordPk])
  return (
    <div className="bg-bkg-2 col-span-12 md:order-first order-last p-4 md:p-6 relative">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <Loading w="12" h="12"></Loading>
        </div>
      )}
      <h1 className="flex mb-8 items-center">
        <PreviousRouteBtn />
        <span className="ml-4">
          Account{' '}
          {!isOwnerOfDeposits && connected && (
            <small className="text-sm text-red">
              (You are viewing other voter account)
            </small>
          )}
        </span>
        <div className="ml-auto flex flex-row">
          <DepositCommunityTokensBtn className="mr-3"></DepositCommunityTokensBtn>
          <WithDrawCommunityTokens></WithDrawCommunityTokens>
        </div>
      </h1>
      {connected ? (
        <div>
          <div className="flex mb-8 flex-wrap">
            {mint && (
              <VotingPowerBox
                votingPower={votingPower}
                mint={mint}
                votingPowerFromDeposits={votingPowerFromDeposits}
                className={mainBoxesClasses}
                style={{ minWidth: '200px' }}
              ></VotingPowerBox>
            )}
            {reducedDeposits?.map((x, idx) => {
              const availableTokens = fmtMintAmount(x.mint, x.currentAmount)
              const price =
                getMintDecimalAmountFromNatural(
                  x.mint,
                  x.currentAmount
                ).toNumber() *
                tokenService.getUSDTokenPrice(x.mintPk.toBase58())
              const tokenName =
                getMintMetadata(x.mintPk)?.name ||
                x.mintPk.toBase58() === realm?.account.communityMint.toBase58()
                  ? realm?.account.name
                  : ''

              const depositTokenName = `${tokenName}`
              const formatter = Intl.NumberFormat('en', {
                notation: 'compact',
              })
              return (
                <div
                  key={idx}
                  className={mainBoxesClasses}
                  style={{ minWidth: '200px' }}
                >
                  <p className="text-fgd-3 text-xs">
                    {depositTokenName}{' '}
                    {x.lockUpKind === 'none' ? 'Deposited' : 'Locked'}
                  </p>
                  <h3 className="mb-0">
                    {availableTokens}{' '}
                    {price ? (
                      <span className="text-xs opacity-70 font-light">
                        =${formatter.format(price)}
                      </span>
                    ) : null}
                  </h3>
                </div>
              )
            })}
          </div>
          <h1 className="mb-8">Locked Tokens</h1>
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
            <div className="flex flex-col items-center justify-center p-8 bg-bkg-4 mb-3">
              <div className="flex text-center mb-6">
                Increase your voting power by<br></br> locking your tokens.
              </div>
              <Button onClick={() => setIsLockModalOpen(true)}>
                Lock Tokens
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center h-20 items-center">
          Please connect your wallet
        </div>
      )}
      {isLockModalOpen && (
        <LockTokensModal
          isOpen={isLockModalOpen}
          onClose={() => setIsLockModalOpen(false)}
        ></LockTokensModal>
      )}
    </div>
  )
}

export default LockTokensAccount
