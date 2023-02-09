import React from 'react'
import ReactDateTimePicker from 'react-datetime-picker/dist/entry.nostyle'
import { StyledLabel } from './styles'

const DateTimePicker: React.FC<{
  value: Date
  onChange: (value: Date) => void
  minDate: Date
  disableClock: boolean
  label?: string
  wrapperClassName?: string
  subtitle?: string
  required?: boolean
  clearIcon?: string | null
  calendarIcon?: string | null
}> = ({
  value,
  onChange,
  minDate,
  disableClock,
  label,
  wrapperClassName = 'w-full',
  subtitle,
  required,
  clearIcon,
  calendarIcon,
}) => {
  return (
    <div className={`flex flex-col relative ${wrapperClassName}`}>
      {label && <StyledLabel>{label}</StyledLabel>}
      {subtitle && <p className="text-fgd-3 mb-1 -mt-2">{subtitle}</p>}
      <ReactDateTimePicker
        onChange={onChange}
        value={value}
        disableClock={disableClock}
        minDate={minDate}
        required={required}
        clearIcon={clearIcon}
        calendarIcon={calendarIcon}
      />
    </div>
  )
}

export default DateTimePicker
