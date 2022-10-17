import * as yup from 'yup'
import * as anchor from '@project-serum/anchor'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  fmtBnMintDecimals,
  parseMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import classNames from 'classnames'
import { FC, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import useSerumGovStore, {
  LockedAccountType,
  SRM_DECIMALS,
} from 'stores/useSerumGovStore'
import { notify } from '@utils/notifications'
import useWallet from '@hooks/useWallet'
import useWalletStore from 'stores/useWalletStore'
import { useRouter } from 'next/router'
import useRealm from '@hooks/useRealm'
import useQueryContext from '@hooks/useQueryContext'
import useCreateProposal from '@hooks/useCreateProposal'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey, TokenAmount } from '@solana/web3.js'
import Loading from '@components/Loading'
import { dryRunInstruction } from 'actions/dryRunInstruction'
import Link from 'next/link'
import { getExplorerUrl } from '@components/explorer/tools'
import { ExternalLinkIcon } from '@heroicons/react/outline'

const BurnLockedAccountSchema = {
  amount: yup.string().required(),
}

type BurnLockedAccountFormValues = {
  amount: number
}

type Props = {
  account: LockedAccountType
  gsrmBalance: TokenAmount | null
  callback?: () => Promise<void>
  createProposal?: {
    governance?: ProgramAccount<Governance>
    owner: PublicKey
  }
}
const LockedAccount: FC<Props> = ({
  account,
  createProposal,
  gsrmBalance,
  callback,
}) => {
  const router = useRouter()
  const { cluster } = router.query

  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()

  const actions = useSerumGovStore((s) => s.actions)

  const { anchorProvider, wallet } = useWallet()
  const connection = useWalletStore((s) => s.connection.current)

  const [isBurning, setIsBurning] = useState(false)

  const { handleCreateProposal } = useCreateProposal()

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

  const handleBurn: SubmitHandler<BurnLockedAccountFormValues> = async ({
    amount,
  }) => {
    if (
      !gsrmBalance ||
      isNaN(parseFloat(amount.toString())) ||
      !wallet ||
      !wallet.publicKey
    ) {
      notify({
        type: 'error',
        message: 'Something went wrong. Please try refreshing.',
      })
      return
    }
    setIsBurning(true)
    const amountAsBN = parseMintNaturalAmountFromDecimalAsBN(
      amount,
      SRM_DECIMALS
    )
    // Check if amount > balance
    if (amountAsBN.gt(new anchor.BN(gsrmBalance.amount))) {
      notify({
        type: 'error',
        message: 'You do not have enough gSRM to redeem',
      })
      setIsBurning(false)
      return
    }
    // Check if amount > (total - burned)
    if (amountAsBN.gt(account.totalGsrmAmount.sub(account.gsrmBurned))) {
      notify({
        type: 'error',
        message: `Only ${fmtBnMintDecimals(
          account.totalGsrmAmount.sub(account.gsrmBurned),
          SRM_DECIMALS
        )} gSRM can be redeemed`,
      })
      setIsBurning(false)
      return
    }
    if (!createProposal) {
      await actions.burnLockedGsrm(
        connection,
        anchorProvider,
        account,
        amountAsBN,
        wallet
      )
      if (callback) await callback()
    } else {
      const ix = await actions.getBurnLockedGsrmInstruction(
        anchorProvider,
        account,
        amountAsBN,
        createProposal.owner
      )

      const serializedIx = serializeInstructionToBase64(ix)

      const instructionData = {
        data: getInstructionDataFromBase64(serializedIx),
        holdUpTime:
          createProposal.governance?.account.config.minInstructionHoldUpTime,
        prerequisiteInstructions: [],
        shouldSplitIntoSeparateTxs: false,
      }

      const { response: dryRunResponse } = await dryRunInstruction(
        connection,
        wallet!,
        instructionData.data
      )
      if (dryRunResponse.err) {
        notify({ type: 'error', message: 'Transaction Simulation Failed' })
        setIsBurning(false)
        return
      }

      const proposalAddress = await handleCreateProposal({
        title: `Serum DAO: Redeeming ${amount} gSRM`,
        description: `Redeeming ${amount} gSRM to redeem vested ${
          account.isMsrm ? 'MSRM' : 'SRM'
        }.`,
        instructionsData: [instructionData],
        governance: createProposal.governance!,
      })
      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )
      await router.push(url)
    }
    setIsBurning(false)
  }

  return (
    <div className="p-3 rounded-md border-2 border-bkg-4">
      <div className="flex items-center space-x-2">
        <div
          className={classNames(
            'border',
            'inline-flex',
            'items-center space-x-1',
            'min-w-max',
            'items-center',
            'px-2',
            'py-1',
            'rounded-full',
            'border-1',
            'border-blue',
            'font-medium'
          )}
        >
          <p className="text-xs text-blue">Locked</p>
          <Link
            href={getExplorerUrl(cluster as string, account.address)}
            passHref
          >
            <a target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="h-4 w-4 text-blue" />
            </a>
          </Link>
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
      <div className="mt-3 flex flex-col space-y-1 flex-1">
        <p className="text-xs">Redeemable gSRM</p>
        <p className="text-lg font-semibold">
          <>
            {fmtBnMintDecimals(
              account.totalGsrmAmount.sub(account.gsrmBurned),
              SRM_DECIMALS
            )}
            /{fmtBnMintDecimals(account.totalGsrmAmount, SRM_DECIMALS)}
          </>
        </p>
      </div>
      <form
        onSubmit={handleSubmit(handleBurn)}
        className="mt-2 flex space-x-2 items-stretch"
      >
        <input
          type="text"
          className="p-2 bg-bkg-3 rounded-md flex-1 focus:outline-none border-2 border-bkg-4"
          {...register('amount', {
            required: 'This field is required.',
            valueAsNumber: true,
          })}
        />

        <button
          type="submit"
          className="bg-bkg-4 p-2 px-3 text-xs text-fgd-3 font-semibold rounded-md self-stretch"
          disabled={isBurning || !wallet?.publicKey}
        >
          {!isBurning ? 'Redeem' : <Loading />}
        </button>
      </form>
      {errors.amount ? <p>{errors.amount.message}</p> : null}
    </div>
  )
}

export default LockedAccount
