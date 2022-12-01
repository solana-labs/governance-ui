import { StyledLabel, StyledSuffix, inputClasses } from './styles'
import ErrorField from './ErrorField'
import { CheckCircleIcon } from '@heroicons/react/outline'

interface InputProps {
  type: string
  value: any
  onChange?: (e) => void
  className?: string
  disabled?: boolean
  useDefaultStyle?: boolean
  [x: string]: any
  checkIcon?: boolean
}

const Input = ({
  checkIcon = false,
  type,
  value = '',
  onChange,
  className,
  wrapperClassName = 'w-full',
  disabled,
  label,
  prefix,
  prefixClassName,
  suffix,
  min,
  error = '',
  max = Number.MAX_SAFE_INTEGER,
  step,
  showErrorState = false,
  noMaxWidth,
  useDefaultStyle = true,
  subtitle,
  ...props
}: InputProps) => {
  return (
    <div className={`flex flex-col relative ${wrapperClassName}`}>
      {label && <StyledLabel>{label}</StyledLabel>}
      {subtitle && <p className="text-fgd-3 mb-1 -mt-2">{subtitle}</p>}
      {prefix ? (
        <div
          className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${prefixClassName}`}
        >
          {prefix}
        </div>
      ) : null}
      <input
        max={max}
        min={min}
        type={type}
        value={value}
        onChange={onChange}
        className={inputClasses({
          className,
          disabled,
          error,
          noMaxWidth,
          useDefaultStyle,
          showErrorState,
        })}
        disabled={disabled}
        step={step}
        {...props}
      />

      {checkIcon && !error && (
        <CheckCircleIcon className="w-6 h-6 absolute right-2 top-1/2 text-green" />
      )}

      {suffix && <StyledSuffix>{suffix}</StyledSuffix>}

      <div className={error ? 'pt-1' : ''}>
        <ErrorField text={error}></ErrorField>
      </div>
    </div>
  )
}

export default Input
