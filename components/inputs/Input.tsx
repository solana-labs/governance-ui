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
  noMaxWidth,
  subtitle,
  ...props
}: InputProps) => {
  return (
    <div className={`flex flex-col relative ${wrapperClassName}`}>
      {label && <StyledLabel>{label}</StyledLabel>}
      {subtitle && <p className="text-gray-500 mb-3">{subtitle}</p>}
      <input
        max={max}
        min={min}
        type={type}
        value={value}
        onChange={onChange}
        className={inputClasses({ className, disabled, error, noMaxWidth })}
        disabled={disabled}
        step={step}
        {...props}
      />
      {suffix && <StyledSuffix>{suffix}</StyledSuffix>}
      <div className={error && 'pt-1'}>
        <ErrorField text={error}></ErrorField>
      </div>
    </div>
  )
}

export default Input
