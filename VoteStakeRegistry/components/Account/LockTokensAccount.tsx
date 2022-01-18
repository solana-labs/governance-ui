import Button from '@components/Button'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import useRealm from '@hooks/useRealm'
import { RpcContext } from '@solana/spl-governance'
import { fmtMintAmount } from '@tools/sdk/units'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import LockTokensModal from './LockTokensModal'
import { getProgramVersionForRealm } from '@models/registry/api'
import {
  DepositWithMintPk,
  getUsedDeposits,
  oneDaySeconds,
} from 'VoteStakeRegistry/utils/voteRegistryTools'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
import { voteRegistryWithdraw } from 'VoteStakeRegistry/actions/voteRegistryWithdraw'
import DepositCommunityTokensBtn from '../TokenBalance/DepositCommunityTokensBtn'
import WithDrawCommunityTokens from '../TokenBalance/WithdrawCommunityTokensBtn'

const LockTokensAccount = () => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection.current)
  const endpoint = useWalletStore((s) => s.connection.endpoint)
  const {
    realm,
    realmInfo,
    realmTokenAccount,
    ownTokenRecord,
    mint,
    tokenRecords,
  } = useRealm()
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const {
    client,
    calcMintMultiplier,
    communityMintRegistrar,
  } = useVoteRegistry()
  // Do not show deposits for mints with zero supply because nobody can deposit anyway
  if (!mint || mint.supply.isZero()) {
    return null
  }
  const [depositRecords, setDeposits] = useState<DepositWithMintPk[] | null>(
    null
  )
  const depositTokenRecord = ownTokenRecord

  const depositTokenAccount = realmTokenAccount

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

  const handleWithDrawFromDeposit = async (depositEntry: DepositWithMintPk) => {
    const rpcContext = new RpcContext(
      realm!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection,
      endpoint
    )

    await voteRegistryWithdraw(
      rpcContext,
      depositTokenAccount!.publicKey!,
      depositTokenRecord!.account.governingTokenMint,
      realm!.pubkey!,
      depositEntry.amountDepositedNative,
      tokenRecords[wallet!.publicKey!.toBase58()].pubkey!,
      depositEntry.index,
      client
    )
    handleGetUsedDeposits()
  }

  useEffect(() => {
    if (client && connection && depositTokenRecord) {
      handleGetUsedDeposits()
    }
  }, [connection, client, depositTokenRecord])

  const cardLabel = (label, value) => {
    return (
      <div className="flex flex-col w-1/2 p-2">
        <div className="text-xs text-fgd-3">{label}</div>
        <div>{value}</div>
      </div>
    )
  }
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
            ?.map((x, idx) => {
              const availableTokens = fmtMintAmount(
                x.mint.account,
                x.amountDepositedNative
              )
              return (
                <div
                  key={idx}
                  className="border border-bkg-4 w-80 mr-3 rounded-lg mb-3"
                >
                  <div className="bg-bkg-4 px-4 py-4 pr-16 rounded-md flex flex-col">
                    <h3 className="mb-0">{availableTokens}</h3>
                  </div>
                  <div className="p-4 bg-bkg-1 rounded-lg">
                    <div className="flex flex-row flex-wrap">
                      {cardLabel('Type', Object.keys(x.lockup.kind)[0])}
                      {cardLabel(
                        'Initial amount',
                        fmtMintAmount(
                          x.mint.account,
                          x.amountInitiallyLockedNative
                        )
                      )}
                      {cardLabel('Schedule', 'xxx p/m')}
                      {cardLabel(
                        'Vote multiplier',
                        calcMintMultiplier(
                          x.lockup.endTs.sub(x.lockup.startTs).toNumber(),
                          communityMintRegistrar
                        )
                      )}
                      {cardLabel(
                        'Time left',
                        `${
                          x.lockup.endTs.sub(x.lockup.startTs).toNumber() /
                          oneDaySeconds
                        } days`
                      )}
                      {cardLabel(
                        'Available',
                        fmtMintAmount(x.mint.account, x.amountDepositedNative)
                      )}
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleWithDrawFromDeposit(x)}
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>
              )
            })}
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
