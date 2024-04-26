import classNames from 'classnames'

import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import { BigNumber } from 'bignumber.js'
import clsx from 'clsx'
import { useMemo } from 'react'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import { useJoinRealm } from '@hooks/useJoinRealm'
import { Transaction } from '@solana/web3.js'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useConnection } from '@solana/wallet-adapter-react'
import Button from '@components/Button'
import { sendTransaction } from '@utils/send'
import { DriftDeposit } from './DriftDeposit'
import { BN } from '@coral-xyz/anchor'

interface Props {
  className?: string
  role: 'community' | 'council'
}

export default function PluginVotingPower({ role, className }: Props) {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { connection } = useConnection()
  const realm = useRealmQuery().data?.result
  const {
    userNeedsTokenOwnerRecord,
    userNeedsVoterWeightRecords,
    handleRegister,
  } = useJoinRealm()
  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result

  const isLoading = useDepositStore((s) => s.state.isLoading)

  const { calculatedVoterWeight, isReady } = useRealmVoterWeightPlugins(role)

  const vanillaValue = calculatedVoterWeight?.initialValue
  const stakedValue = calculatedVoterWeight?.value?.sub(
    vanillaValue ?? new BN(0)
  )

  const formattedTotal = useMemo(
    () =>
      mintInfo && calculatedVoterWeight?.value
        ? new BigNumber(calculatedVoterWeight?.value.toString())
            .shiftedBy(-mintInfo.decimals)
            .toFormat(2)
        : undefined,
    [mintInfo, calculatedVoterWeight?.value]
  )

  const formattedStaked = useMemo(
    () =>
      mintInfo && stakedValue
        ? new BigNumber(stakedValue.toString())
            .shiftedBy(-mintInfo.decimals)
            .toFormat(2)
        : undefined,
    [mintInfo, stakedValue]
  )

  const formattedVanilla = useMemo(
    () =>
      mintInfo && vanillaValue
        ? new BigNumber(vanillaValue.toString())
            .shiftedBy(-mintInfo.decimals)
            .toFormat(2)
        : undefined,
    [mintInfo, vanillaValue]
  )

  // There are two buttons available on this UI:
  // The Deposit button - available if you have tokens to deposit
  // The Join button - available if you have already deposited tokens (you have a Token Owner Record)
  // but you may not have all your Voter Weight Records yet.
  // This latter case may occur if the DAO changes its configuration and new Voter Weight Records are required.
  // For example if a new plugin is added.
  const showJoinButton =
    !userNeedsTokenOwnerRecord && userNeedsVoterWeightRecords

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
    <div className={clsx(className)}>
      <div>
        <div className="flex items-center justify-between mt-1">
          <div className=" flex flex-col gap-x-2">
            <div className={clsx(className)}>
              <div className={'p-3 rounded-md bg-bkg-1'}>
                <div className="text-fgd-3 text-xs">Votes</div>
                <div className="text-xl font-bold text-fgd-1 hero-text">
                  {formattedTotal ?? 0}
                </div>
                {formattedStaked &&
                  stakedValue?.gtn(0) &&
                  formattedVanilla &&
                  vanillaValue?.gtn(0) && (
                    <>
                      <div className="text-fgd-3 text-xs">
                        {formattedStaked} from Drift insurance staking
                      </div>
                      <div className="text-fgd-3 text-xs">
                        {formattedVanilla} from Realms deposit
                      </div>
                    </>
                  )}
              </div>
            </div>
            <div className="text-xl font-bold text-fgd-1 hero-text">
              {connected && showJoinButton && (
                <Button className="w-full" onClick={join}>
                  Join
                </Button>
              )}
              <DriftDeposit role={role} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
