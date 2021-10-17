import { StyledPrefix, StyledSuffix, inputClasses } from './styles'

interface TextareaProps {
  value: any
  onChange?: (e) => void
  className?: string
  disabled?: boolean
  [x: string]: any
}

const TextareaProps = ({
  value,
  onChange,
  className,
  wrapperClassName = 'w-full',
  disabled,
  prefix,
  suffix,
  error = '',
  ...props
}: TextareaProps) => {
  return (
    <div className={`flex-col relative ${wrapperClassName}`}>
      {prefix && <StyledPrefix>{prefix}</StyledPrefix>}
      <textarea
        value={value}
        onChange={onChange}
        className={inputClasses({ className, disabled, prefix, error })}
        disabled={disabled}
        {...props}
      />
      {suffix ? <StyledSuffix>{suffix}</StyledSuffix> : null}
      {error && <div className="text-red text-xs">{error}</div>}
    </div>
  )
}

export default TextareaProps
