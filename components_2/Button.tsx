import { FunctionComponent } from 'react'
import Loading from '../components/Loading'
import Tooltip from '../components/Tooltip'

interface ButtonProps {
  className?: string
  isLoading?: boolean
  onClick?: () => void
  disabled?: boolean
  small?: boolean
  tooltipMessage?: string
  style?: any
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  className,
  disabled,
  isLoading,
  small,
  tooltipMessage = '',
  style,
  ...props
}) => {
  return (
    <button
      className={`${className} default-transition font-bold px-20 ${
        small ? 'py-3' : 'py-5'
      } text-base font-bold focus:outline-none ${
        disabled
          ? 'bg-cover bg-btn-blue cursor-not-allowed text-fgd-3'
          : 'bg-cover bg-btn-blue text-bkg-1 hover:bg-btn-blue-hover active:bg-btn-blue-active active:text-fgd-1 '
      }`}
      {...props}
      style={style}
      disabled={disabled}
    >
      <Tooltip content={tooltipMessage}>
        <div>{isLoading ? <Loading /> : children}</div>
      </Tooltip>
    </button>
  )
}

export default Button

// export const SecondaryButton: FunctionComponent<ButtonProps> = ({
//   children,
//   onClick,
//   disabled = false,
//   className,
//   isLoading,
//   small = false,
//   tooltipMessage = '',
//   ...props
// }) => {
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${className} border border-primary-light default-transition font-bold rounded-full px-4 ${
//         small ? 'py-1' : 'py-2.5'
//       } text-primary-light text-sm hover:border-primary-dark hover:text-primary-dark focus:outline-none disabled:border-fgd-3 disabled:text-fgd-3 disabled:cursor-not-allowed`}
//       {...props}
//     >
//       <Tooltip content={tooltipMessage}>
//         <div>{isLoading ? <Loading /> : children}</div>
//       </Tooltip>
//     </button>
//   )
// }

// export const LinkButton: FunctionComponent<ButtonProps> = ({
//   children,
//   onClick,
//   disabled = false,
//   className,
//   ...props
// }) => {
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${className} border-0 default-transition text-sm disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-60 focus:outline-none`}
//       {...props}
//     >
//       {children}
//     </button>
//   )
// }
