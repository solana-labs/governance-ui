import { FunctionComponent } from 'react'

interface ButtonProps {
  onClick?: (x?) => void
  disabled?: boolean
  className?: string
}

const Button: FunctionComponent<ButtonProps> = ({
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
      className={`${className} px-6 py-2 border border-th-fgd-4 bg-th-bkg-2 rounded-md text-th-fgd-1
      active:border-th-primary hover:bg-th-bkg-3 focus:outline-none disabled:bg-th-bkg-2 
      disabled:text-th-fgd-4 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
