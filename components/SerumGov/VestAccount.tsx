import * as yup from 'yup'
import * as anchor from '@project-serum/anchor'
import { yupResolver } from '@hookform/resolvers/yup'
import useWallet from '@hooks/useWallet'
import {
  fmtMintAmount,
  parseMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import classNames from 'classnames'
import { FC, useEffect, useMemo, useState } from 'react'
import useSerumGovStore, {
  MSRM_MULTIPLIER,
  SRM_DECIMALS,
  VestAccountType,
} from 'stores/useSerumGovStore'
import useWalletStore from 'stores/useWalletStore'
import { SubmitHandler, useForm } from 'react-hook-form'
import { notify } from '@utils/notifications'
import { MSRM_DECIMALS } from '@project-serum/serum/lib/token-instructions'
import { BigNumber } from 'bignumber.js'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

const BurnVestAccountSchema = {
  amount: yup.string().required(),
}

type BurnVestAccountFormValues = {
  amount: number
}

type Props = {
  account: VestAccountType
  createProposal?: {
    governance?: ProgramAccount<Governance>
    owner: PublicKey
  }
}
const VestAccount: FC<Props> = ({ account }) => {
  const gsrmBalance = useSerumGovStore((s) => s.gsrmBalance)
  const gsrmMint = useSerumGovStore((s) => s.gsrmMint)
  const actions = useSerumGovStore((s) => s.actions)

  const { anchorProvider, wallet } = useWallet()
  const connection = useWalletStore((s) => s.connection.current)

  const [currentTimestamp, setCurrentTimestamp] = useState(0)

  useEffect(() => {
    const timestampInterval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(timestampInterval)
  })

  const schema = yup.object(BurnVestAccountSchema).required()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BurnVestAccountFormValues>({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      amount: 0,
    },
  })

  const redeemableAmount = useMemo(() => {
    const cliffEnd = account.createdAt + account.cliffPeriod
    const timeVested = currentTimestamp - cliffEnd

    if (timeVested <= 0) return

    let vestedAmount = account.totalGsrmAmount
      .mul(new anchor.BN(timeVested))
      .div(new anchor.BN(account.linearVestingPeriod))

    vestedAmount = vestedAmount.lte(account.totalGsrmAmount)
      ? vestedAmount
      : account.totalGsrmAmount

    const redeemable = vestedAmount
      .sub(account.gsrmBurned)
      .div(account.isMsrm ? new anchor.BN(1_000_000_000_000) : new anchor.BN(1))

    return new BigNumber(redeemable.toString())
      .shiftedBy(-1 * (account.isMsrm ? MSRM_DECIMALS : SRM_DECIMALS))
      .toFormat()
  }, [account, currentTimestamp])

  // TODO:  handle amount for MSRM
  const handleBurn: SubmitHandler<BurnVestAccountFormValues> = async ({
    amount,
  }) => {
    if (!gsrmMint || !gsrmBalance || isNaN(parseFloat(amount.toString()))) {
      return
    }
    let amountAsBN = parseMintNaturalAmountFromDecimalAsBN(
      amount,
      account.isMsrm ? MSRM_DECIMALS : SRM_DECIMALS
    )
    if (account.isMsrm)
      amountAsBN = amountAsBN.mul(new anchor.BN(MSRM_MULTIPLIER))

    // Check if amount > balance
    if (amountAsBN.gt(new anchor.BN(gsrmBalance.amount))) {
      notify({ type: 'error', message: 'You do not have enough gSRM to burn' })
      return
    }
    // Check if amount > (total - burned)
    if (amountAsBN.gt(account.totalGsrmAmount.sub(account.gsrmBurned))) {
      notify({
        type: 'error',
        message: `Only ${fmtMintAmount(
          gsrmMint,
          account.totalGsrmAmount.sub(account.gsrmBurned)
        )} gSRM can be burned`,
      })
      return
    }
    await actions.burnVestGsrm(
      connection,
      anchorProvider,
      account,
      amountAsBN,
      wallet
    )
  }
  return (
    <div className="p-3 rounded-md border-2 border-bkg-4 w-full">
      <div className="flex items-center space-x-2">
        <div
          className={classNames(
            'border',
            'inline-flex',
            'min-w-max',
            'items-center',
            'px-2',
            'py-1',
            'rounded-full',
            'text-xs',
            'border-1',
            'border-orange',
            'text-orange',
            'font-medium'
          )}
        >
          Vest Account
        </div>
        <div
          className={classNames(
            'border',
            'inline-flex',
            'min-w-max',
            'items-center',
            'px-2',
            'py-1',
            'rounded-full',
            'text-xs',
            'border-1',
            'border-fgd-2',
            'text-fgd-2',
            'font-medium'
          )}
        >
          {account.isMsrm ? 'MSRM' : 'SRM'}
        </div>
      </div>
      <div className="flex items-stretch justify-between">
        <div className="mt-3 flex flex-col space-y-1 flex-1">
          <p className="text-xs">
            Redeemable {account.isMsrm ? 'MSRM' : 'SRM'}
          </p>
          <p className="text-lg font-semibold">{redeemableAmount || 0}</p>
        </div>
        <div className="mt-3 flex flex-col space-y-1 flex-1">
          <p className="text-xs">gSRM burned</p>
          <p className="text-lg font-semibold">
            {fmtMintAmount(gsrmMint, account.gsrmBurned)}/
            {fmtMintAmount(gsrmMint, account.totalGsrmAmount)}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit(handleBurn)} className="">
        <div className="mt-2 flex space-x-2 items-stretch justify-between w-full">
          <input
            type="text"
            className="p-2 bg-bkg-3 rounded-md focus:outline-none flex-1 border-2 border-bkg-4"
            {...register('amount', {
              required: 'This field is required.',
              valueAsNumber: true,
            })}
          />

          <button
            type="submit"
            className="bg-bkg-4 p-2 px-3 text-xs text-fgd-3 font-semibold rounded-md self-stretch"
          >
            Redeem
          </button>
        </div>
      </form>
      {errors.amount ? <p>{errors.amount.message}</p> : null}
    </div>
  )
}

export default VestAccount
