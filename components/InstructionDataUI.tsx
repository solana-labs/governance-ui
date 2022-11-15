import cx from 'classnames'
import { ReactNode } from 'react'
import { PublicKey } from '@solana/web3.js'

export const InstructionDataUI = ({ children }: { children: ReactNode }) => {
  return <div className={'flex flex-col'}>{children}</div>
}

export const DataUIRow = ({ children }: { children: ReactNode }) => {
  return <div className={cx('mt-2', 'flex')}>{children}</div>
}

export const DataUILabel = ({
  label,
  className,
}: {
  label: string
  className?: string
}) => <span className={cx('font-bold', className)}>{label}: </span>

export const DataUIText = ({
  text,
  className,
}: {
  text: string
  className?: string
}) => <span className={cx('ml-2', className)}>{text}</span>

export const DataUIAmount = ({
  amount,
  symbol = '',
  className,
}: {
  amount: number
  symbol: string
  className?: string
}) => (
  <>
    <span className={cx('ml-2', className)}>
      {amount.toLocaleString()} {symbol}
    </span>
  </>
)

export const DataUIAddress = ({
  address,
  className,
}: {
  address: PublicKey
  className?: string
}) => <span className={cx('ml-2', className)}>{address.toBase58()}</span>

export const DataUIDateUTC = ({
  date,
  className,
}: {
  date: Date
  className?: string
}) => <span className={cx('ml-2', className)}>{date.toISOString()} UTC</span>

export const DataUIWarning = ({
  message,
  className,
}: {
  message: string
  className?: string
}) => <span className={cx('mt-2', className)}>{message.toUpperCase()}</span>
