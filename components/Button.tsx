import { FunctionComponent } from 'react'

interface ButtonProps {
  className?: string
  onClick?: () => void
  disabled?: boolean
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`${className} font-bold px-4 py-2.5 rounded-full text-sm focus:outline-none ${
        disabled
          ? 'bg-bkg-4 cursor-not-allowed text-fgd-2'
          : 'bg-primary-light text-bkg-2 hover:bg-primary-dark'
      }`}
      {...props}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button

export const SecondaryButton: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} border border-primary-light default-transition font-bold rounded-full px-3 py-1 text-primary-light text-sm hover:border-primary-dark hover:text-primary-dark focus:outline-none disabled:border-fgd-4 disabled:text-fgd-4 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  )
}

export const LinkButton: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} border-0 default-transition underline hover:no-underline hover:opacity-60 focus:outline-none`}
      {...props}
    >
      {children}
    </button>
  )
}
