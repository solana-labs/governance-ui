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
  ...props
}: InputProps) => {
  return (
    <div className={`flex relative ${wrapperClassName}`}>
      {prefix ? (
        <div
          className="flex items-center justify-end p-2 border border-r-0 
          border-primary-light bg-bkg-2 h-full text-xs rounded rounded-r-none w-14 text-right"
        >
          {prefix}
        </div>
      ) : null}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`${
          className ? className : ''
        } h-12 px-2 w-full bg-bkg-1 rounded-md text-sm text-fgd-1 
          border border-primary-light default-transition hover:border-primary-dark 
          focus:border-primary-light focus:outline-none 
          ${disabled ? 'cursor-not-allowed hover:border-fgd-4 text-fgd-3' : ''}
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
