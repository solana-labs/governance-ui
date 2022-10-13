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
import {
  fmtBnMintDecimals,
  parseMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import { useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import Loading from '@components/Loading'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import useCreateProposal from '@hooks/useCreateProposal'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { simulateTransaction } from '@utils/send'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { useRouter } from 'next/router'
import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'

type DepositCardProps = {
  mint: 'SRM' | 'MSRM'
  callback?: () => Promise<void>
  createProposal?: {
    governance?: ProgramAccount<Governance>
    owner: PublicKey
  }
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

const DepositCard = ({ mint, callback, createProposal }: DepositCardProps) => {
  const router = useRouter()
  const { symbol } = useRealm()
  const { fmtUrlWithCluster } = useQueryContext()

  const { wallet, anchorProvider } = useWallet()
  const { balance, isLoading, refetch } = useTokenAccountBalance(
    createProposal ? createProposal.owner : wallet?.publicKey,
    MINT_MAP[mint].pubkey
  )

  const connection = useWalletStore((s) => s.connection)
  const actions = useSerumGovStore((s) => s.actions)

  const [isDepositing, setIsDepositing] = useState(false)

  const { handleCreateProposal } = useCreateProposal()

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
        message: `You do not have enough ${mint} to lock`,
      })
      setIsDepositing(false)
      return
    }

    if (!createProposal) {
      await actions.depositLocked(
        connection.current,
        anchorProvider,
        amountAsBN,
        mint === 'MSRM',
        wallet
      )

      await refetch()
      if (callback) await callback()
    } else {
      try {
        const instructions: TransactionInstruction[] = []
        const { owner } = createProposal

        const userAccount = await actions.getUserAccount(anchorProvider, owner)

        if (!userAccount) {
          const initIx = await actions.getInitUserInstruction(
            owner,
            owner,
            anchorProvider
          )
          instructions.push(initIx)
        }

        const ownerAta = await getAssociatedTokenAddress(
          MINT_MAP[mint].pubkey,
          owner,
          true
        )

        const depositIx = await actions.getGrantLockedInstruction(
          owner,
          owner,
          ownerAta,
          anchorProvider,
          amountAsBN,
          MINT_MAP[mint].pubkey === MSRM_MINT
        )
        instructions.push(depositIx)

        const instructionsData: InstructionDataWithHoldUpTime[] = []

        instructions.forEach(async (ix) => {
          const serializedIx = serializeInstructionToBase64(ix)

          const ixData = {
            data: getInstructionDataFromBase64(serializedIx),
            holdUpTime:
              createProposal.governance?.account.config
                .minInstructionHoldUpTime,
            prerequisiteInstructions: [],
            shouldSplitIntoSeparateTxs: false,
          }

          instructionsData.push(ixData)
        })

        const tx = new Transaction({ feePayer: createProposal.owner }).add(
          ...instructions.map((i) => i)
        )
        const simulationResult = await simulateTransaction(
          connection.current,
          tx,
          'single'
        )

        if (simulationResult.value.err) {
          notify({
            type: 'error',
            message: 'Transaction simulation failed.',
          })
          // setIsBurning(false)
          return
        }
        const proposalAddress = await handleCreateProposal({
          title: `Serum DAO: Lock ${fmtBnMintDecimals(
            amountAsBN,
            MINT_MAP[mint].decimals
          )} ${mint}`,
          description: `Locking ${fmtBnMintDecimals(
            amountAsBN,
            MINT_MAP[mint].decimals
          )} ${mint}.`,
          instructionsData,
          governance: createProposal.governance!,
        })
        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )
        await router.push(url)
      } catch (e) {
        console.error('Failed to add Lock Proposal', e)
        notify({
          type: 'error',
          message: `Something went wrong. Please check console.`,
        })
      }
    }

    setIsDepositing(false)
  }

  if (!wallet || !balance || !balance.uiAmount || isLoading) return null

  return (
    <div className="p-3 rounded-md border-2 border-bkg-4">
      <div className="flex items-center justify-between">
        <p className="font-bold lg:text-md text-fgd-2">Lock SRM</p>
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
          className="bg-bkg-4 p-2 px-3 text-xs text-fgd-3 font-semibold rounded-md self-stretch  disabled:text-fgd-4"
          disabled={isDepositing || !wallet?.publicKey}
        >
          {!isDepositing ? 'Lock' : <Loading />}
        </button>
      </form>
    </div>
  )
}

export default DepositCard
