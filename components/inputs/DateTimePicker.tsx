import React, { useState } from 'react'
import { inputClasses, InputClasses, StyledLabel } from './styles'

type DateTimePickerProps = {
  value: Date
  onChange: (value: Date) => void
  minDate: Date
  label?: string
  subtitle?: string
  wrapperClassName?: string
} & InputClasses

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  minDate,
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
  const [internalDate, setInternalDate] = useState(
    value.toISOString().substring(0, value.toISOString().indexOf('T') + 6)
  )
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
        value={internalDate}
        min={minDate
          .toISOString()
          .substring(0, minDate.toISOString().indexOf('T') + 6)}
        onChange={(evt) => {
          setInternalDate(evt.target.value)
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
