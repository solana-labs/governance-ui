import * as yup from 'yup'
import * as anchor from '@project-serum/anchor'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTokenAccountBalance } from '@hooks/useTokenAccountBalance'
import useWallet from '@hooks/useWallet'
import useSerumGovStore, {
  MSRM_DECIMALS,
  MSRM_MINT,
  SRM_DECIMALS,
  SRM_MINT,
} from 'stores/useSerumGovStore'
import { SubmitHandler, useForm } from 'react-hook-form'
import { notify } from '@utils/notifications'
import { parseMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import Loading from '@components/Loading'

type DepositCardProps = {
  mint: 'SRM' | 'MSRM'
  callback?: () => Promise<void>
}

const MINT_MAP = {
  SRM: { pubkey: SRM_MINT, decimals: SRM_DECIMALS },
  MSRM: { pubkey: MSRM_MINT, decimals: MSRM_DECIMALS },
}

const DepositLockedSRMSchema = {
  amount: yup.string().required(),
}

type DepositLockedSRMFormValues = {
  amount: number
}

const DepositCard = ({ mint, callback }: DepositCardProps) => {
  const { wallet, anchorProvider } = useWallet()
  const { balance, isLoading, refetch } = useTokenAccountBalance(
    wallet?.publicKey,
    MINT_MAP[mint].pubkey
  )

  const connection = useWalletStore((s) => s.connection)
  const actions = useSerumGovStore((s) => s.actions)

  const [isDepositing, setIsDepositing] = useState(false)

  const schema = yup.object(DepositLockedSRMSchema).required()
  const { register, handleSubmit } = useForm<DepositLockedSRMFormValues>({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      amount: 0,
    },
  })

  const handleDeposit: SubmitHandler<DepositLockedSRMFormValues> = async ({
    amount,
  }) => {
    if (!balance || !wallet || !wallet.publicKey || isLoading) {
      notify({
        type: 'error',
        message: 'Something went wrong. Please try refreshing.',
      })
      return
    }

    setIsDepositing(true)

    const amountAsBN = parseMintNaturalAmountFromDecimalAsBN(
      amount,
      MINT_MAP[mint].decimals
    )

    if (amountAsBN.gt(new anchor.BN(balance.amount))) {
      notify({
        type: 'error',
        message: `You do not have enough ${mint} to deposit`,
      })
      setIsDepositing(false)
      return
    }

    await actions.depositLocked(
      connection.current,
      anchorProvider,
      amountAsBN,
      mint === 'MSRM',
      wallet
    )

    await refetch()
    if (callback) await callback()

    setIsDepositing(false)
  }

  if (!wallet || !balance || isLoading) return null

  return (
    <div className="p-3 rounded-md border-2 border-bkg-4">
      <div className="flex items-center justify-between">
        <p className="font-bold lg:text-md text-fgd-2">Deposit SRM</p>
        <p className="text-xs text-fgd-3">Balance: {balance.uiAmount}</p>
      </div>
      <form
        onSubmit={handleSubmit(handleDeposit)}
        className="mt-2 flex space-x-2 items-stretch"
      >
        <input
          type="text"
          className="p-2 bg-bkg-3 rounded-md flex-1 focus:outline-none border-2 border-bkg-4"
          placeholder="SRM"
          {...register('amount', {
            required: true,
            valueAsNumber: true,
          })}
        />
        <button
          type="submit"
          className="bg-bkg-4 p-2 px-3 text-xs text-fgd-3 font-semibold rounded-md self-stretch"
          disabled={isDepositing}
        >
          {!isDepositing ? 'Deposit' : <Loading />}
        </button>
      </form>
    </div>
  )
}

export default DepositCard
