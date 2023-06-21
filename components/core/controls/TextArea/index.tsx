import ErrorField from '@components/core/inputs/ErrorField'
import { StyledLabel, StyledSuffix, inputClasses } from '../../inputs/styles'
import cx from '@hub/lib/cx'

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
  subtitle,
  label,
  suffix,
  error = '',
  noMaxWidth = false,
  useDefaultStyle = true,
  ...props
}: TextareaProps) => {
  console.log('Label is: ', label)
  console.log('subtitle is: ', subtitle)
  return (
    <div
      className={cx(
        `flex-col relative ${wrapperClassName}`,
        'bg-zinc-50',
        'border-zinc-300',
        'border',
        'px-3',
        'outline-none',
        'rounded-md',
        'text-neutral-900',
        'transition-colors',
        'hover:border-zinc-400',
        'focus:border-sky-500',
        'placeholder:text-neutral-400',
        'dark:bg-neutral-800',
        'dark:border-neutral-700',
        'dark:placeholder:text-neutral-600',
        'dark:text-neutral-50',
        'disabled:opacity-50',
        'disabled:pointer-events-none'
      )}
    >
      {label && <StyledLabel>{label}</StyledLabel>}
      {subtitle && <p className="text-fgd-3 mb-1 -mt-2">{subtitle}</p>}
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
