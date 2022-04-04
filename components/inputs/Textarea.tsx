import { StyledLabel, StyledSuffix, inputClasses } from './styles'
import ErrorField from './ErrorField'

interface TextareaProps {
  value: any
  onChange?: (e) => void
  className?: string
  disabled?: boolean
  useDefaultStyle?: boolean
  [x: string]: any
}

const TextareaProps = ({
  value,
  onChange,
  className,
  wrapperClassName = 'w-full',
  disabled,
  label,
  suffix,
  error = '',
  noMaxWidth = false,
  useDefaultStyle = true,
  ...props
}: TextareaProps) => {
  return (
    <div className={`flex-col relative ${wrapperClassName}`}>
      {label && <StyledLabel>{label}</StyledLabel>}

      <textarea
        value={value}
        onChange={onChange}
        className={inputClasses({
          className,
          disabled,
          error,
          noMaxWidth,
          useDefaultStyle,
        })}
        disabled={disabled}
        {...props}
      />

      {suffix ? <StyledSuffix>{suffix}</StyledSuffix> : null}

      <ErrorField text={error}></ErrorField>
    </div>
  )
}

export default TextareaProps
