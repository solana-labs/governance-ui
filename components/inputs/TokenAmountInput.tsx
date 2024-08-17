import { PublicKey } from '@solana/web3.js'
import { FC } from 'react'
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
  const validateAmount = () => {
    if (value === undefined || value === '') {
      if (props.required) {
        setError('Token amount is required')
      }
      return
    }

    setValue(
      Math.max(
        1,
        Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
      ).toFixed(0)
    )
  }

  return (
    <Input
      disabled={props.disabled || mint === undefined}
      min={1}
      label="Amount"
      value={value}
      type="number"
      onChange={(e) => {
        setValue(e.target.value)
        setError(undefined)
      }}
      step={1}
      error={props.error}
      onBlur={(e) => {
        props.onBlur?.(e)
        validateAmount()
      }}
    />
  )
}

export default TokenAmountInput
