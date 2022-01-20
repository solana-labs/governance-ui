import Button from '@components/Button'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import { useState } from 'react'
import LockTokensModal from './LockTokensModal'
import DepositCommunityTokensBtn from '../TokenBalance/DepositCommunityTokensBtn'
import WithDrawCommunityTokens from '../TokenBalance/WithdrawCommunityTokensBtn'
import DepositCard from './DepositCard'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import PreviousRouteBtn from '@components/PreviousRouteBtn'

const LockTokensAccount = () => {
  const { realm, mint } = useRealm()
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const deposits = useDepositStore((s) => s.state.deposits)
  const votingPower = useDepositStore((s) => s.state.votingPower)
  const votingPowerFmt =
    votingPower && mint ? fmtMintAmount(mint, votingPower) : '0'

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
          <div className="bg-bkg-1 px-4 py-4 pr-16 rounded-md flex flex-col mr-3 mb-3 w-44">
            <p className="text-fgd-3 text-xs">Votes</p>
            <h3 className="mb-0">{votingPowerFmt}</h3>
          </div>
          {deposits?.map((x, idx) => {
            const availableTokens = fmtMintAmount(
              x.mint.account,
              x.amountDepositedNative
            )
            const tokenName =
              getMintMetadata(x.mint.publicKey)?.name ||
              x.mint.publicKey.toBase58() ===
                realm?.account.communityMint.toBase58()
                ? realm?.account.name
                : ''

            const depositTokenName = `${tokenName}`
            return (
              <div
                key={idx}
                className="bg-bkg-1 px-4 py-4 pr-16 rounded-md flex flex-col mr-3 mb-3 w-44"
              >
                <p className="text-fgd-3 text-xs">
                  {depositTokenName}{' '}
                  {typeof x.lockup.kind.none !== 'undefined'
                    ? 'Deposited'
                    : 'Locked'}
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
