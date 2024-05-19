import classNames from 'classnames'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { getMintMetadata } from '@components/instructions/programs/splToken'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import { useDelegatorAwareVoterWeight } from '@hooks/useDelegatorAwareVoterWeight'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import { BigNumber } from 'bignumber.js'
import clsx from 'clsx'
import { useMemo } from 'react'
import { useJoinRealm } from '@hooks/useJoinRealm'
import { sendTransaction } from '@utils/send'
import { Transaction } from '@solana/web3.js'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useConnection } from '@solana/wallet-adapter-react'
import Button from '@components/Button'

interface Props {
  className?: string
  role: 'community' | 'council'
  showDepositButton?: boolean
}

export default function TokenHaverVotingPower({ role, className }: Props) {
  /** ideally this would all be removed and registration would be automatic upon acting */
  const wallet = useWalletOnePointOh()
  const { connection } = useConnection()
  const {
    userNeedsTokenOwnerRecord,
    userNeedsVoterWeightRecords,
    handleRegister,
  } = useJoinRealm()
  const join = async () => {
    const instructions = await handleRegister()
    const transaction = new Transaction()
    transaction.add(...instructions)

    await sendTransaction({
      transaction: transaction,
      wallet: wallet!,
      connection,
      signers: [],
      sendingMessage: `Registering`,
      successMessage: `Registered`,
    })
  }
  const showJoinButton =
    !!wallet?.connected &&
    (userNeedsTokenOwnerRecord || userNeedsVoterWeightRecords)

  /** */

  const realm = useRealmQuery().data?.result
  const voterWeight = useDelegatorAwareVoterWeight(role)

  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result

  const isLoading = useDepositStore((s) => s.state.isLoading)
  const { isReady } = useRealmVoterWeightPlugins(role)

  const relevantMint =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const tokenName =
    getMintMetadata(relevantMint)?.name ?? realm?.account.name ?? ''

  const formattedTotal = useMemo(
    () =>
      mintInfo && voterWeight?.value
        ? new BigNumber(voterWeight?.value.toString())
            .shiftedBy(-mintInfo.decimals)
            .toFixed(0)
            .toString()
        : undefined,
    [mintInfo, voterWeight?.value]
  )

  if (isLoading || !isReady) {
    return (
      <div
        className={classNames(
          className,
          'rounded-md bg-bkg-1 h-[76px] animate-pulse'
        )}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="flex items-center justify-between mt-1 w-full">
          <div className={`${clsx(className)} w-full`}>
            <div className="flex flex-col">
              <div className="text-fgd-3 text-xs">
                {tokenName}
                {role === 'council' ? ' Council' : ''} votes
              </div>
              <div className="flex items-center">
                <p className="font-bold mr-2 text-xl">
                  {formattedTotal ?? '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showJoinButton && (
        <Button className="w-full" onClick={join}>
          Join
        </Button>
      )}
    </div>
  )
}
