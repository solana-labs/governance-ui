import { StyledLabel, StyledSuffix, inputClasses } from './styles'
import ErrorField from './ErrorField'

interface InputProps {
  type: string
  value: any
  onChange?: (e) => void
  className?: string
  disabled?: boolean
  [x: string]: any
}

const Input = ({
  type,
  value = '',
  onChange,
  className,
  wrapperClassName = 'w-full',
  disabled,
  label,
  suffix,
  min,
  error = '',
  max = Number.MAX_SAFE_INTEGER,
  step,
  ...props
}: InputProps) => {
  return (
    <div className={`flex flex-col relative ${wrapperClassName}`}>
      {label && <StyledLabel>{label}</StyledLabel>}
      <input
        max={max}
        min={min}
        type={type}
        value={value}
        onChange={onChange}
        className={inputClasses({ className, disabled, error })}
        disabled={disabled}
        step={step}
        {...props}
      />
      {suffix && <StyledSuffix>{suffix}</StyledSuffix>}
      <ErrorField text={error}></ErrorField>
    </div>
  )
}

export default Input
