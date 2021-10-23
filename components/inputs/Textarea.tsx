import { StyledPrefix, StyledSuffix, inputClasses } from './styles'
import ErrorField from './ErrorField'

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
      <ErrorField text={error}></ErrorField>
    </div>
  )
}

export default TextareaProps
