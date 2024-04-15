import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { PublicKey } from '@solana/web3.js'
import { precision } from '@utils/formatting'
import BigNumber from 'bignumber.js'
import { FC, useMemo } from 'react'
import Input, { InputProps } from './Input'

type Props = Omit<
  InputProps,
  'min' | 'step' | 'onChange' | 'type' | 'value'
> & {
  mint: PublicKey | undefined
  value: string | undefined
  setValue: (x: string) => void
  setError: (x: string | undefined) => void
}

/**
 * @deprecated
 * I feel like I must have been on drugs when I wrote this
 */
const TokenAmountInput: FC<Props> = ({
  mint,
  setValue,
  setError,
  value,
  ...props
}) => {
  const { data: mintInfo } = useMintInfoByPubkeyQuery(mint)

  const mintMinAmount = useMemo(
    () =>
      mintInfo?.result
        ? new BigNumber(1).shiftedBy(mintInfo.result.decimals).toNumber()
        : 1,
    [mintInfo?.result]
  )

  const currentPrecision = useMemo(() => precision(mintMinAmount), [
    mintMinAmount,
  ])

  const validateAmount = () => {
    if (value === undefined || value === '') {
      if (props.required) {
        setError('Token amount is required')
      }
      return
    }

    setValue(
      Math.max(
        Number(mintMinAmount),
        Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
      ).toFixed(currentPrecision)
    )
  }

  return (
    <Input
      disabled={props.disabled || mint === undefined}
      min={mintMinAmount}
      label="Amount"
      value={value}
      type="number"
      onChange={(e) => {
        setValue(e.target.value)
        setError(undefined)
      }}
      step={mintMinAmount}
      error={props.error}
      onBlur={(e) => {
        props.onBlur?.(e)
        validateAmount()
      }}
    />
  )
}

export default TokenAmountInput
