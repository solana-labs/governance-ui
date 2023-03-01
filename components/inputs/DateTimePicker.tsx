import React from 'react'
import { inputClasses, InputClasses, StyledLabel } from './styles'

type DateTimePickerProps = {
  value: Date
  onChange: (value: Date) => void
  label?: string
  subtitle?: string
  wrapperClassName?: string
} & InputClasses

const parseDate = (date: Date): string => {
  const isoString = toISOStringWithTimezone(date)
  const substr = isoString.substring(0, isoString.indexOf('T') + 6)
  return substr
}

const toISOStringWithTimezone = (date: Date) => {
  const tzOffset = -date.getTimezoneOffset()
  const diff = tzOffset >= 0 ? '+' : '-'
  const pad = (n: number, len = 2) =>
    `${Math.floor(Math.abs(n))}`.padStart(len, '0')
  return (
    pad(date.getFullYear(), 4) +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    diff +
    pad(tzOffset / 60) +
    ':' +
    pad(tzOffset % 60)
  )
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  wrapperClassName = 'w-full',
  subtitle,
  className = '',
  disabled,
  error,
  noMaxWidth = false,
  useDefaultStyle = true,
  showErrorState = false,
}) => {
  return (
    <div className={`flex flex-col relative ${wrapperClassName}`}>
      {label && <StyledLabel>{label}</StyledLabel>}
      {subtitle && <p className="text-fgd-3 mb-1 -mt-2">{subtitle}</p>}
      <input
        className={inputClasses({
          className,
          disabled,
          error,
          noMaxWidth,
          useDefaultStyle,
          showErrorState,
        })}
        type="datetime-local"
        value={parseDate(value)}
        onChange={(evt) => {
          if (!evt.target['validity'].valid) return
          const date = new Date(evt.target.value)
          if (isFinite(date.getTime())) {
            onChange(date)
          }
        }}
        step={60}
      />
    </div>
  )
}

export default DateTimePicker
