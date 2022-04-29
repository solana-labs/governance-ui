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
          : 'bg-cover bg-btn-blue text-bkg-1 hover:bg-btn-blue-hover active:bg-btn-blue-hover active:text-fgd-1'
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

interface AltButtonProps {
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  secondary?: boolean
  tertiary?: boolean
  inverse?: boolean
  withBorder?: boolean
}

export const AltButton: FunctionComponent<AltButtonProps> = ({
  children,
  disabled,
  isLoading,
  secondary = false,
  tertiary = false,
  inverse = false,
  withBorder = false,
  ...props
}) => {
  let className = `z-0 relative transition-all duration-300 rounded-full font-serif text-[16px] hover:cursor-pointer opacity-[84] hover:opacity-100 `

  if (secondary && !inverse) {
    // secondary
    className +=
      'py-3 px-2 bg-[#201F27] font-regular text-white transition-to-white-background hover:text-black'
  } else if (secondary && inverse) {
    // secondary inverse
  } else if (tertiary) {
    className += 'py-3 px-2 font-regular hover:bg-white/10'
  } else if (withBorder) {
    className +=
      'py-3 px-2 font-regular border border-white transition-to-white-background hover:text-black'
  } else if (inverse) {
    // primary inverse
  } else {
    // primary
    className +=
      'py-4 px-2 font-light text-black bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] transition-to-white-background'
  }

  if (isLoading) {
    className += ` flex items-center`
  }

  return (
    <button className={className} {...props} disabled={disabled || isLoading}>
      {isLoading && (
        <div className="pl-4">
          <Loading />
        </div>
      )}
      <div>{children}</div>
    </button>
  )
}
