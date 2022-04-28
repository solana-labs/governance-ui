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

export const PopUpButton: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  isLoading,
  small = false,
  tooltipMessage = '',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} default-transition px-8 ${
        small ? 'py-2' : 'py-3.5'
      } inline-flex items-center text-fgd-1 text-xs hover:bg-white hover:bg-opacity-30 focus:outline-none active:bg-white active:bg-opacity-20`}
      {...props}
    >
      <Tooltip content={tooltipMessage}>
        <div>{isLoading ? <Loading /> : children}</div>
      </Tooltip>
      <img
        src="/img/realms-web/buttons/Export-white.svg"
        className="h-3 ml-2"
      />
    </button>
  )
}

export const PopUpButtonBorder: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  isLoading,
  small = false,
  tooltipMessage = '',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} border border-white default-transition px-8 ${
        small ? 'py-2' : 'py-4'
      } inline-flex items-center text-fgd-1 text-black text-xs font-bold hover:bg-white hover:bg-opacity-30 focus:outline-none active:bg-white active:bg-opacity-20`}
      {...props}
    >
      <Tooltip content={tooltipMessage}>
        <div>{isLoading ? <Loading /> : children}</div>
      </Tooltip>
      <img
        src="/img/realms-web/buttons/Export-black.svg"
        className="h-3 ml-2"
      />
    </button>
  )
}

export const ExploreButton: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  isLoading,
  small = false,
  tooltipMessage = '',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} default-transition px-8 bg-origin-border ${
        small ? 'py-2' : 'py-3.5'
      } inline-flex items-center text-fgd-1 text-xs font-bold hover:bg-gradient-to-r from-realms-theme-blue to-realms-theme-turquoise active:bg-gradient-to-r active:opacity-80`}
      {...props}
    >
      <img
        src="/img/realms-web/icons/binoculars-white.svg"
        className="h-4 mr-2"
      />
      <Tooltip content={tooltipMessage}>
        <div>{isLoading ? <Loading /> : children}</div>
      </Tooltip>
    </button>
  )
}

interface AltButtonProps {
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  secondary?: boolean
  tertiary?: boolean
  inverse?: boolean
  withBoarder?: boolean
}

export const AltButton: FunctionComponent<AltButtonProps> = ({
  children,
  disabled,
  isLoading,
  secondary = false,
  tertiary = false,
  inverse = false,
  withBoarder = false,
  ...props
}) => {
  let className = `z-0 relative transition-all duration-300 rounded-full text-[16px] hover:cursor-pointer opacity-[84] hover:opacity-100 `

  if (secondary && !inverse) {
    // secondary
    className +=
      'py-3 px-2 bg-[#201F27] font-regular text-white transition-to-white-background hover:text-black'
  } else if (secondary && inverse) {
    // secondary inverse
  } else if (tertiary) {
    className += 'py-3 px-2 font-regular hover:bg-white/10'
  } else if (withBoarder) {
    className +=
      'py-3 px-2 font-regular border border-white transition-to-white-background hover:text-black'
  } else if (inverse) {
    // primary inverse
  } else {
    // primary
    className +=
      'py-4 px-2 font-light text-black bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] transition-to-white-background'
  }

  return (
    <button className={className} {...props} disabled={disabled || isLoading}>
      {isLoading && <Loading />}
      <div>{children}</div>
    </button>
  )
}
