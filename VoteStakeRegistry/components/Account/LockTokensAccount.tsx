import Button from '@components/Button'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import { useEffect, useState } from 'react'
import LockTokensModal from './LockTokensModal'
import DepositCommunityTokensBtn from '../TokenBalance/DepositCommunityTokensBtn'
import WithDrawCommunityTokens from '../TokenBalance/WithdrawCommunityTokensBtn'
import DepositCard from './DepositCard'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import VotesBox from '../TokenBalance/votesBox'
import { PublicKey } from '@solana/web3.js'
import { MintInfo } from '@solana/spl-token'
import { BN } from '@project-serum/anchor'
interface DepositBox {
  mintPk: PublicKey
  mint: MintInfo
  currentAmount: BN
  lockUpKind: string
}
const unlockedTypes = ['none']

const LockTokensAccount = () => {
  const { realm, mint } = useRealm()
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [reducedDeposits, setReducedDeposits] = useState<DepositBox[]>()
  const deposits = useDepositStore((s) => s.state.deposits)
  const votingPower = useDepositStore((s) => s.state.votingPower)
  const votingPowerFromDeposits = useDepositStore(
    (s) => s.state.votingPowerFromDeposits
  )
  const mainBoxesClasses =
    'bg-bkg-1 px-4 py-4 pr-16 rounded-md flex flex-col mr-3 mb-3 min-w-44'
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
  useEffect(() => {
    const handleReduceDeposits = () => {
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
      setReducedDeposits(reducedDeposits)
    }
    handleReduceDeposits()
  }, [JSON.stringify(deposits)])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-bkg-2 col-span-12 md:order-first order-last p-4 md:p-6 rounded-lg">
        <h1 className="flex mb-8 items-center">
          <PreviousRouteBtn />
          <span className="ml-4">Account</span>
          <div className="ml-auto flex flex-row">
            <DepositCommunityTokensBtn className="mr-3"></DepositCommunityTokensBtn>
            <WithDrawCommunityTokens></WithDrawCommunityTokens>
          </div>
        </h1>
        <div className="flex mb-8 flex-wrap">
          {mint && (
            <VotesBox
              votingPower={votingPower}
              mint={mint}
              votingPowerFromDeposits={votingPowerFromDeposits}
              className={mainBoxesClasses}
            ></VotesBox>
          )}
          {reducedDeposits?.map((x, idx) => {
            const availableTokens = fmtMintAmount(x.mint, x.currentAmount)
            const tokenName =
              getMintMetadata(x.mintPk)?.name ||
              x.mintPk.toBase58() === realm?.account.communityMint.toBase58()
                ? realm?.account.name
                : ''

            const depositTokenName = `${tokenName}`
            return (
              <div key={idx} className={mainBoxesClasses}>
                <p className="text-fgd-3 text-xs">
                  {depositTokenName}{' '}
                  {x.lockUpKind === 'none' ? 'Deposited' : 'Locked'}
                </p>
                <h3 className="mb-0">{availableTokens}</h3>
              </div>
            )
          })}
        </div>
        <h1 className="mb-8">Locked Tokens</h1>
        <div className="flex mb-8 flex-wrap">
          {deposits
            ?.filter((x) => typeof x.lockup.kind.none === 'undefined')
            ?.map((x, idx) => (
              <DepositCard deposit={x} key={idx}></DepositCard>
            ))}
          <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-bkg-4 mb-3">
            <div className="flex text-center mb-6">
              Increase your voting power by<br></br> locking your tokens.
            </div>
            <Button onClick={() => setIsLockModalOpen(true)}>
              Lock Tokens
            </Button>
          </div>
        </div>
      </div>
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
