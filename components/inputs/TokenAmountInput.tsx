import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { PublicKey } from '@solana/web3.js'
import { precision } from '@utils/formatting'
import { FC } from 'react'
import Input, { InputProps } from './Input'

type Props = Omit<
  InputProps,
  'min' | 'step' | 'onChange' | 'type' | 'value'
> & {
  value: string | undefined
  mint: PublicKey
  setValue: (x: string) => void
  setError: (x: string | undefined) => void
}

const TokenAmountInput: FC<Props> = ({
  mint,
  setValue,
  setError,
  value,
  ...props
}) => {
  const { data: mintInfo } = useMintInfoByPubkeyQuery(mint)

  const mintMinAmount = mintInfo?.found
    ? // @ts-expect-error this discrimination fails on 4.6 but not future versions of TS
      new BigNumber(1).shiftedBy(mintInfo.result.decimals).toNumber()
    : 1

  const currentPrecision = precision(mintMinAmount)

  const validateAmountOnBlur = () => {
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
        validateAmountOnBlur()
      }}
    />
  )
}

export default TokenAmountInput
