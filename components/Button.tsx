import { FunctionComponent, useState, useEffect } from 'react'
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
      className={`${className} default-transition font-bold px-4 rounded-full ${
        small ? 'py-1' : 'py-2.5'
      } text-sm focus:outline-none ${
        disabled
          ? 'bg-fgd-4 cursor-not-allowed text-fgd-3'
          : 'bg-primary-light text-bkg-2 hover:bg-fgd-1'
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

export const SecondaryButton: FunctionComponent<ButtonProps> = ({
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
      className={`${className} border border-primary-light font-bold default-transition rounded-full px-4 ${
        small ? 'py-1' : 'py-2.5'
      } text-primary-light text-sm hover:border-primary-dark hover:text-primary-dark focus:outline-none disabled:border-fgd-3 disabled:text-fgd-3 disabled:cursor-not-allowed`}
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
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
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
  const [loadingStart, setLoadingStart] = useState(false)
  const [loadingEnd, setLoadingEnd] = useState(false)

  let classNames = `heading-cta default-transition rounded-full focus-visible:outline-none disabled:cursor-not-allowed `

  if (loading || loadingEnd) {
    classNames += ' h-[64px] min-w-[208px] border'
    if (loadingEnd) {
      classNames +=
        ' border-confirm-green disabled:border-confirm-green text-confirm-green disabled:text-confirm-green'
    } else {
      classNames += ' border-white disabled:border-white'
    }
  } else if (secondary) {
    classNames +=
      'py-3 px-2 h-[64px] min-w-[208px] text-white border border-white/30 focus:border-white hover:bg-white hover:text-black active:bg-white/70 active:text-black active:border-none disabled:bg-white/10 disabled:text-black disabled:border-none '
  } else {
    // this is a primary button
    // TODO: make sure this using the typogrpahic class for CTAs
    classNames +=
      'py-4 px-2 h-[64px] min-w-[208px] text-black bg-white hover:bg-white/70 active:bg-white/50 active:border-none focus:border-2 focus:border-[#00E4FF] disabled:bg-white/10'
  }

  classNames += ` ${className}`

  useEffect(() => {
    if (!loading && loadingStart) {
      setLoadingEnd(true)
      setLoadingStart(false)
    } else {
      setLoadingStart(true)
    }
  }, [loading])

  useEffect(() => {
    if (loadingEnd) {
      setTimeout(() => {
        setLoadingEnd(false)
      }, 3000)
    }
  }, [loadingEnd])
  return (
    <button
      className={classNames}
      disabled={props.disabled || loading || loadingEnd}
      {...props}
    >
      {!loading && !loadingEnd ? (
        children
      ) : loadingEnd ? (
        <div className="flex justify-center">
          <svg
            width="16"
            height="13"
            viewBox="0 0 16 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.4144 3.41436L6.00015 12.8286L0.585938 7.41437L3.41436 4.58594L6.00015 7.17172L12.5859 0.585938L15.4144 3.41436Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ) : (
        <LoadingDots />
      )}
    </button>
  )
}

export const RadioButton: FunctionComponent<NewButtonProps> = ({
  className = '',
  selected = false,
  children,
  ...props
}) => {
  const [hoverState, setHoverState] = useState(false)
  let classNames =
    'py-3 px-2 h-[72px] min-w-[208px] text-white rounded border border-white/30 hover:bg-white/10 hover:border-white disabled:opacity-20 disabled:hover:border-white/30'
  if (selected) {
    classNames += ' bg-white/10 border-white focus:border-blue'
  } else {
    classNames += ' focus:bg-white/30 focus:border-none'
  }

  classNames += ` ${className}`
  return (
    <button
      className={classNames}
      type="button"
      disabled={props.disabled}
      {...props}
      onMouseOver={() => {
        setHoverState(true)
      }}
      onMouseOut={() => {
        setHoverState(false)
      }}
    >
      <div className="flex items-center justify-center space-x-3">
        <GradientCheckmarkCircle selected={selected} hover={hoverState} />
        <Header as="h6">{children}</Header>
      </div>
    </button>
  )
}
