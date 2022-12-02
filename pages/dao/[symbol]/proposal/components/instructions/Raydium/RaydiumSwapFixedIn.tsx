import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { Liquidity } from '@raydium-io/raydium-sdk'
import { uiToNative } from '@blockworks-foundation/mango-client'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import { validateInstruction } from '@utils/instructionTools'
import {
  UiInstruction,
  RaydiumSwapFixedInForm,
} from '@utils/uiTypes/proposalCreationTypes'
import Select from '@components/inputs/Select'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Input from '@components/inputs/Input'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import { NewProposalContext } from '../../../new'
import useRaydiumPoolsForSwap from '@hooks/useRaydiumPoolsForSwap'
import { findATAAddrSync } from '@utils/ataTools'
import TypeaheadSelect from '@components/TypeaheadSelect'
import { debounce } from '@utils/debounce'
import { getMinimumAmountOut } from '@utils/instructions/Raydium/helpers'
import Link from 'next/link'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { TransactionInstruction } from '@solana/web3.js'

const schema = yup.object().shape({
  governedTokenAccount: yup
    .object()
    .required('Governed token account is required'),
  poolName: yup.string().required('Liquidity Pool is required'),
  amountIn: yup
    .number()
    .moreThan(0, 'Amount in should be more than 0')
    .required('Amount in is required'),
  minAmountOut: yup.number(),
  slippage: yup.number().required('Slippage value is required'),
})

const SLIPPAGE_OPTIONS = [0.5, 0.7, 1, 1.5, 2, 3, 4, 5, 10]

const SwapFixedInInstructionForm = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const [loadingPools, setLoadingPools] = useState<boolean>(false)

  const connection = useWalletStore((s) => s.connection.current)
  const wallet = useWalletStore((s) => s.current)
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const { handleSetInstructions } = useContext(NewProposalContext)

  const [form, setForm] = useState<RaydiumSwapFixedInForm>({
    slippage: 0.5,
  })
  const [formErrors, setFormErrors] = useState({})

  // Only load pools about following mint to avoid loading ALL pools (thousands of them)
  const pools = useRaydiumPoolsForSwap(
    form.governedTokenAccount?.extensions.mint?.publicKey
  )

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const shouldBeGoverned = !!(index !== 0 && governance)

  const getInstruction = async (): Promise<UiInstruction> => {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    const { governedTokenAccount, poolName, amountIn, slippage } = form

    if (
      !isValid ||
      !governedTokenAccount ||
      !governedTokenAccount.governance?.account ||
      !wallet ||
      !wallet.publicKey ||
      !pools ||
      !poolName ||
      typeof amountIn === 'undefined' ||
      typeof slippage === 'undefined'
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: governedTokenAccount?.governance,
      }
    }

    const prerequisiteInstructions: TransactionInstruction[] = []

    const {
      poolKeys,
      tokenIn: { mint: tokenInMint, decimals: tokenInDecimals },
      tokenOut: { mint: tokenOutMint, decimals: tokenOutDecimals },
    } = pools[poolName]

    const { version } = poolKeys

    const owner = governedTokenAccount.extensions.token?.account.owner

    if (!owner) {
      throw new Error('Selected token account does not have owner information')
    }

    const [tokenAccountIn] = findATAAddrSync(owner, tokenInMint)
    const [tokenAccountOut] = findATAAddrSync(owner, tokenOutMint)

    const minAmountOut = await getMinimumAmountOut({
      poolKeys,
      tokenIn: {
        mint: tokenInMint,
        decimals: tokenInDecimals,
      },
      tokenOut: {
        mint: tokenOutMint,
        decimals: tokenOutDecimals,
      },
      amountIn,
      connection,
      slippage,
    })

    const instruction = Liquidity.makeSwapFixedInInstruction(
      {
        poolKeys,
        userKeys: {
          tokenAccountIn,
          tokenAccountOut,
          owner,
        },
        amountIn: uiToNative(amountIn, tokenInDecimals),
        minAmountOut: uiToNative(minAmountOut, tokenOutDecimals),
      },
      version
    )

    // If tokenAccountOut is not initialize, create it
    if (!(await connection.getAccountInfo(tokenAccountOut))) {
      const createAtaInstruction = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenOutMint,
        tokenAccountOut,
        owner,
        wallet.publicKey!
      )

      prerequisiteInstructions.push(createAtaInstruction)
    }

    return {
      serializedInstruction: serializeInstructionToBase64(instruction),
      isValid: true,
      governance: governedTokenAccount.governance,
      additionalSerializedInstructions: [],
      prerequisiteInstructions,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedTokenAccount?.governance,
        getInstruction,
      },
      index
    )
    // Only set instruction when form changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  useEffect(() => {
    // Calculate on the fly the minimum amount out
    debounce.debounceFcn(async () => {
      if (!form.amountIn || !form.poolName || !pools) return

      const { poolKeys, tokenIn, tokenOut } = pools[form.poolName]

      const minAmountOut = await getMinimumAmountOut({
        poolKeys,
        tokenIn: {
          mint: tokenIn.mint,
          decimals: tokenIn.decimals,
        },
        tokenOut: {
          mint: tokenOut.mint,
          decimals: tokenOut.decimals,
        },
        connection,
        amountIn: form.amountIn,
        slippage: form.slippage,
      })

      handleSetForm({
        value: minAmountOut,
        propertyName: 'minAmountOut',
      })
    })
  }, [
    connection,
    form.amountIn,
    form.poolName,
    form.slippage,
    handleSetForm,
    pools,
  ])

  useEffect(() => {
    if (!pools) return

    setLoadingPools(false)
  }, [pools])

  return (
    <>
      <GovernedAccountSelect
        label="Source account"
        governedAccounts={governedTokenAccountsWithoutNfts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' })
          setLoadingPools(true)
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      {loadingPools ? (
        <div className="text-white">Loading pools ...</div>
      ) : null}

      {!loadingPools && pools && form.governedTokenAccount ? (
        <>
          <div className="text-sm relative top-2">Authority</div>

          {form.governedTokenAccount.extensions.token?.account.owner.toBase58() ? (
            <div className="mt-2">
              <Link
                href={`https://explorer.solana.com/address/${form.governedTokenAccount.extensions.token?.account.owner.toBase58()}`}
              >
                {form.governedTokenAccount.extensions.token?.account.owner.toBase58()}
              </Link>
            </div>
          ) : null}

          <div className="text-sm relative top-2">Select Pools</div>

          {Object.keys(pools).length ? (
            <TypeaheadSelect
              className="w-1/2"
              placeholder="Search Pools"
              options={Object.keys(pools).map((poolName) => ({
                key: poolName,
                text: poolName,
              }))}
              selected={
                form.poolName
                  ? {
                      key: form.poolName,
                    }
                  : undefined
              }
              onSelect={(option) => {
                if (!option?.key) {
                  return handleSetForm({
                    value: undefined,
                    propertyName: 'poolName',
                  })
                }

                const poolName = option.key

                handleSetForm({
                  value: poolName,
                  propertyName: 'poolName',
                })
              }}
            />
          ) : (
            <div className="text-white mt-2 text-sm">No pool available</div>
          )}

          {pools && form.poolName && pools[form.poolName] ? (
            <>
              <Input
                label={`${pools[form.poolName].tokenIn.name} amount in to swap`}
                value={form.amountIn}
                type="number"
                min={0}
                onChange={(evt) =>
                  handleSetForm({
                    value: evt.target.value,
                    propertyName: 'amountIn',
                  })
                }
                error={formErrors['amountIn']}
              />

              <Select
                label="Slippage (%)"
                value={form.slippage}
                onChange={(value) =>
                  handleSetForm({ value, propertyName: 'slippage' })
                }
                error={formErrors['slippage']}
              >
                {SLIPPAGE_OPTIONS.map((value) => (
                  <Select.Option key={value} value={value}>
                    {value}
                  </Select.Option>
                ))}
              </Select>

              <Input
                label={`Minimum ${
                  pools[form.poolName].tokenOut.name
                } amount received`}
                value={form.minAmountOut}
                type="number"
                min={0}
                disabled={true}
                error={formErrors['minAmountOut']}
              />
            </>
          ) : null}
        </>
      ) : null}
    </>
  )
}

export default SwapFixedInInstructionForm
