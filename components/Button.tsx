import { FunctionComponent } from 'react'
import Loading from './Loading'

interface ButtonProps {
  className?: string
  isLoading?: boolean
  onClick?: () => void
  disabled?: boolean
  small?: boolean
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  className,
  disabled,
  isLoading,
  small,
  ...props
}) => {
  return (
    <button
      className={`${className} default-transition font-bold px-4 rounded-full ${
        small ? 'py-1' : 'py-2.5'
      } text-sm focus:outline-none ${
        disabled
          ? 'bg-bkg-4 cursor-not-allowed text-fgd-2'
          : 'bg-primary-light text-bkg-2 hover:bg-primary-dark'
      }`}
      {...props}
      disabled={disabled}
    >
      {isLoading ? <Loading /> : children}
    </button>
  )
}

export default Button

export const SecondaryButton: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  isLoading,
  small = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} border border-primary-light default-transition font-bold rounded-full px-4 ${
        small ? 'py-1' : 'py-2.5'
      } text-primary-light text-sm hover:border-primary-dark hover:text-primary-dark focus:outline-none disabled:border-fgd-3 disabled:text-fgd-3 disabled:cursor-not-allowed`}
      {...props}
    >
      {isLoading ? <Loading /> : children}
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
      className={`${className} border-0 default-transition text-sm underline hover:no-underline hover:opacity-60 focus:outline-none`}
      {...props}
    >
      {children}
    </button>
  )
}
