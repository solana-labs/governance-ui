import { FunctionComponent } from 'react'
import Loading, { LoadingDots } from './Loading'
import Tooltip from './Tooltip'
import Header from './Header'
import GradientCheckmarkCircle from './NewRealmWizard/components/GradientCheckmarkCircle'
interface ButtonProps {
  className?: string
  isLoading?: boolean
  onClick?: () => void
  disabled?: boolean
  small?: boolean
  tooltipMessage?: string
  style?: any
  type?: 'button' | 'submit'
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  className,
  disabled,
  isLoading,
  small,
  tooltipMessage = '',
  style,
  type = 'button',
  ...props
}) => {
  return (
    <button
      className={`${className} default-transition font-bold px-4 rounded-full ${
        small ? 'py-2' : 'py-2.5'
      } text-sm focus:outline-none ${
        disabled
          ? 'bg-fgd-4 cursor-not-allowed text-fgd-3'
          : 'bg-primary-light text-bkg-2 hover:bg-fgd-1'
      }`}
      {...props}
      style={style}
      type={type}
      disabled={disabled}
    >
      <Tooltip content={tooltipMessage}>
        <div>{isLoading ? <Loading /> : children}</div>
      </Tooltip>
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
  tooltipMessage = '',
  type = 'button',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${className} border border-primary-light font-bold default-transition rounded-full px-4 ${
        small ? 'py-1' : 'py-2.5'
      } text-primary-light text-sm hover:border-fgd-1 hover:text-fgd-1 focus:outline-none disabled:border-fgd-4 disabled:text-fgd-3 disabled:cursor-not-allowed`}
      {...props}
    >
      <Tooltip content={tooltipMessage}>
        <div>{isLoading ? <Loading /> : children}</div>
      </Tooltip>
    </button>
  )
}

export const LinkButton: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  type = 'button',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${className} border-0 default-transition text-sm disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-60 focus:outline-none`}
      {...props}
    >
      {children}
    </button>
  )
}

interface NewButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  secondary?: boolean
  radio?: boolean
  selected?: boolean
  className?: string
}

export const NewButton: FunctionComponent<NewButtonProps> = ({
  className = '',
  loading = false,
  secondary = false,
  children,
  ...props
}) => {
  let classNames = `heading-cta default-transition rounded-full focus-visible:outline-none disabled:cursor-not-allowed `

  if (loading) {
    classNames +=
      ' h-[64px] min-w-[208px] border border-fgd-3 disabled:border-fgd-3'
  } else if (secondary) {
    classNames +=
      'py-3 px-2 h-[64px] min-w-[208px] text-fgd-1 border border-fgd-3 focus:border-fgd-1 hover:bg-fgd-1 hover:text-bkg-1 active:bg-fgd-2 active:text-bkg-1 active:border-none disabled:bg-fgd-4 disabled:text-bkg-1 disabled:border-none '
  } else {
    // this is a primary button
    // TODO: make sure this using the typogrpahic class for CTAs
    classNames +=
      'py-4 px-2 h-[64px] min-w-[208px] text-bkg-1 bg-fgd-1 hover:bg-fgd-2 active:bg-fgd-3 active:border-none focus:border-2 focus:border-[#00E4FF] disabled:bg-fgd-4'
  }

  classNames += ` ${className}`

  return (
    <button
      className={classNames}
      disabled={props.disabled || loading}
      {...props}
    >
      {!loading ? children : <LoadingDots />}
    </button>
  )
}

export const RadioButton: FunctionComponent<NewButtonProps> = ({
  className = '',
  selected = false,
  disabled = false,
  children,
  ...props
}) => {
  let classNames =
    'group default-transition py-3 px-2 h-[72px] min-w-[208px] text-fgd-1 rounded border disabled:cursor-not-allowed'

  if (selected) {
    classNames += ' bg-bkg-4 border-fgd-1 focus:border-blue'
  } else {
    classNames += ' focus:bg-fgd-3 focus:border-none'
  }

  if (!disabled) {
    classNames += 'hover:bg-bkg-4 hover:border-fgd-1 border-fgd-3'
  } else {
    classNames += ' bg-none text-fgd-4 border-bkg-4'
  }

  classNames += ` ${className}`
  return (
    <button className={classNames} type="button" disabled={disabled} {...props}>
      <div className="flex items-center pl-4 space-x-3 md:pl-0 md:justify-center">
        <GradientCheckmarkCircle selected={selected} />
        <Header as="cta">{children}</Header>
      </div>
    </button>
  )
}
