import { FunctionComponent } from 'react'

interface ButtonProps {
  onClick?: (x?) => void
  disabled?: boolean
  className?: string
  secondary?: boolean
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  secondary = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} ${
        secondary || disabled
          ? 'bg-bkg-4'
          : 'bg-gradient-to-br from-secondary-1-light via-secondary-1-dark to-secondary-2-light'
      } bg-bkg-4 border-none default-transition px-6 py-2 rounded-lg text-fgd-1
      active:border-primary hover:bg-bkg-3 focus:outline-none 
      disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
