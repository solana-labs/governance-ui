import { StyledPrefix, StyledSuffix, inputClasses } from './styles'

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
  value,
  onChange,
  className,
  wrapperClassName = 'w-full',
  disabled,
  prefix,
  suffix,
  min,
  max = Number.MAX_SAFE_INTEGER,
  ...props
}: InputProps) => {
  return (
    <div className={`flex flex-col relative ${wrapperClassName}`}>
      {prefix ? <StyledPrefix>{prefix}</StyledPrefix> : null}
      <input
        max={max}
        min={min}
        type={type}
        value={value}
        onChange={onChange}
        className={inputClasses({ className, disabled, prefix })}
        disabled={disabled}
        {...props}
      />
      {suffix ? <StyledSuffix>{suffix}</StyledSuffix> : null}
    </div>
  )
}

export default Input
