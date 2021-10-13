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
  ...props
}: TextareaProps) => {
  return (
    <div className={`flex-col relative ${wrapperClassName}`}>
      {prefix ? <StyledPrefix>{prefix}</StyledPrefix> : null}
      <textarea
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

export default TextareaProps
