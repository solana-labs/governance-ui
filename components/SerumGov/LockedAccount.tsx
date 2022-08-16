import * as yup from 'yup'
import * as anchor from '@project-serum/anchor'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  fmtMintAmount,
  parseMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import classNames from 'classnames'
import { FC, useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import useSerumGovStore, { LockedAccountType } from 'stores/useSerumGovStore'
import { notify } from '@utils/notifications'
import useWallet from '@hooks/useWallet'
import useWalletStore from 'stores/useWalletStore'

const BurnLockedAccountSchema = {
  amount: yup.string().required(),
}

type BurnLockedAccountFormValues = {
  amount: number
}

type Props = {
  account: LockedAccountType
}
const LockedAccount: FC<Props> = ({ account }) => {
  const gsrmBalance = useSerumGovStore((s) => s.gsrmBalance)
  const gsrmMint = useSerumGovStore((s) => s.gsrmMint)
  const actions = useSerumGovStore((s) => s.actions)

  const { anchorProvider, wallet } = useWallet()
  const connection = useWalletStore((s) => s.connection.current)

  const schema = yup.object(BurnLockedAccountSchema).required()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BurnLockedAccountFormValues>({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      amount: 0,
    },
  })

  useEffect(() => {
    console.log(errors)
  }, [errors])

  const handleBurn: SubmitHandler<BurnLockedAccountFormValues> = async ({
    amount,
  }) => {
    console.log(parseFloat(amount.toString()))
    if (!gsrmMint || !gsrmBalance || isNaN(parseFloat(amount.toString()))) {
      return
    }
    const amountAsBN = parseMintNaturalAmountFromDecimalAsBN(
      amount,
      gsrmMint.decimals
    )
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
    }
    console.log(amountAsBN.toNumber())
    await actions.burnLockedGsrm(
      connection,
      anchorProvider,
      account,
      amountAsBN,
      wallet
    )
  }

  return (
    <div className="p-3 rounded-md border-2 border-bkg-4">
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
          'border-fgd-3',
          'text-fgd-3',
          'font-medium'
        )}
      >
        Locked Account
      </div>
      <div className="mt-3 flex items-end space-x-1">
        <p className="text-2xl font-semibold">
          {fmtMintAmount(gsrmMint, account.gsrmBurned)}/
          {fmtMintAmount(gsrmMint, account.totalGsrmAmount)}
        </p>
        <p className="text-xs mb-1">gSRM redeemed</p>
      </div>
      <form
        onSubmit={handleSubmit(handleBurn)}
        className="mt-2 flex space-x-2 items-stretch"
      >
        <input
          type="text"
          className="p-2 bg-bkg-3 rounded-md flex-1 focus:outline-none"
          {...register('amount', {
            required: 'This field is required.',
            valueAsNumber: true,
          })}
        />

        <button
          type="submit"
          className="bg-bkg-4 p-2 px-4 text-xs text-fgd-3 font-semibold rounded-md"
        >
          Burn
        </button>
      </form>
      {errors.amount ? <p>{errors.amount.message}</p> : null}
    </div>
  )
}

export default LockedAccount
