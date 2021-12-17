interface InputProps {
  type: string
  value: any
  onChange?: (e) => void
  className?: string
  disabled?: boolean
  error?: boolean
  [x: string]: any
}

const Input = ({
  type,
  value,
  onChange,
  className,
  error,
  wrapperClassName = 'w-full',
  disabled,
  prefix,
  suffix,
  ...props
}: InputProps) => {
  return (
    <div className={`flex relative ${wrapperClassName}`}>
      {prefix ? (
        <div
          className="flex items-center justify-end p-2 border border-r-0 
            border-fgd-4 bg-bkg-2 h-full text-xs rounded rounded-r-none w-14 text-right"
        >
          {prefix}
        </div>
      ) : null}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`${className} font-display px-2 py-2 w-full bg-bkg-1 rounded text-fgd-1 
            border default-transition hover:border-primary-dark 
            focus:border-primary-light focus:outline-none ${
              error ? 'border-red' : 'border-fgd-4'
            }
            ${
              disabled ? 'cursor-not-allowed hover:border-fgd-4 text-fgd-3' : ''
            }
              ${prefix ? 'rounded-l-none' : ''}`}
        disabled={disabled}
        {...props}
      />
      {suffix ? (
        <span className="absolute right-0 text-xs flex items-center pr-2 h-full bg-transparent text-fgd-4">
          {suffix}
        </span>
      ) : null}
    </div>
  )
}

export default Input
