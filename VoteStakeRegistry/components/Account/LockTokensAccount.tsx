import Button from '@components/Button'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import useRealm from '@hooks/useRealm'
import { fmtMintAmount } from '@tools/sdk/units'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import LockTokensModal from './LockTokensModal'
import {
  DepositWithMintAccount,
  getUsedDeposits,
} from 'VoteStakeRegistry/utils/voteRegistryTools'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
import DepositCommunityTokensBtn from '../TokenBalance/DepositCommunityTokensBtn'
import WithDrawCommunityTokens from '../TokenBalance/WithdrawCommunityTokensBtn'
import DepositCard from './DepositCard'

const LockTokensAccount = () => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)
  const { realm, ownTokenRecord } = useRealm()
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const { client } = useVoteRegistry()
  const [depositRecords, setDeposits] = useState<
    DepositWithMintAccount[] | null
  >(null)
  const depositTokenRecord = ownTokenRecord

  const handleGetUsedDeposits = async () => {
    const deposits = await getUsedDeposits(
      realm!.pubkey,
      wallet!.publicKey!,
      depositTokenRecord!.account.governingTokenMint,
      client!,
      connection
    )
    if (deposits) {
      setDeposits(deposits)
    }
  }

  useEffect(() => {
    if (client && connection && depositTokenRecord) {
      handleGetUsedDeposits()
    }
  }, [connection, client, depositTokenRecord])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-bkg-2 col-span-12 md:order-first order-last p-4 md:p-6 rounded-lg">
        <h1 className="flex mb-8">
          Account
          <div className="ml-auto">
            <DepositCommunityTokensBtn
              afterDepositFcn={() => {
                if (depositTokenRecord) {
                  handleGetUsedDeposits()
                }
              }}
            ></DepositCommunityTokensBtn>
            <WithDrawCommunityTokens
              afterWithdrawFcn={handleGetUsedDeposits}
            ></WithDrawCommunityTokens>
          </div>
        </h1>
        <div className="flex mb-8">
          {depositRecords?.map((x, idx) => {
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
                className="bg-bkg-1 px-4 py-4 pr-16 rounded-md flex flex-col mr-3"
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
          {depositRecords
            ?.filter((x) => typeof x.lockup.kind.none === 'undefined')
            ?.map((x, idx) => (
              <DepositCard deposit={x} key={idx}></DepositCard>
            ))}
        </div>
        <div className="flex">
          <div className="flex flex-col items-center p-8 rounded-lg bg-bkg-4">
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
