import { FunctionComponent, useEffect, useState } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  secondary?: boolean
  radio?: boolean
  selected?: boolean
  className?: string
}

export const Button: FunctionComponent<ButtonProps> = ({
  className = '',
  loading = false,
  secondary = false,
  radio = false,
  selected = false,
  children,
  ...props
}) => {
  const [loadingStart, setLoadingStart] = useState(false)
  const [loadingEnd, setLoadingEnd] = useState(false)

  let classNames = `heading-cta default-transition rounded-full focus-visible:outline-none disabled:cursor-not-allowed `

  if (secondary) {
    classNames +=
      'py-3 px-2 h-[64px] min-w-[208px] text-white border border-white/30 focus:border-white hover:bg-white hover:text-black active:bg-white/70 active:text-black active:border-none disabled:bg-white/10 disabled:text-black disabled:border-none '
  } else if (radio) {
    classNames +=
      'py-3 px-2 h-[64px] min-w-[208px] text-white border border-white/30 disabled:text-black disabled:border-2'
    if (selected) {
      classNames +=
        ' bg-white text-black border-white border-2 focus:border-[#00E4FF]'
    } else {
      classNames +=
        ' focus:bg-white/10 focus:border-none hover:border-white hover:bg-none '
    }
  } else if (loading || loadingEnd) {
    classNames += ' h-[64px] min-w-[208px] border border-white'
    if (loadingEnd) {
      classNames += ' border-[#8EFFDD] text-[#8EFFDD]'
    }
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
      }, 5000)
    }
  }, [loadingEnd])
  return (
    <button
      className={classNames}
      type={radio ? 'button' : props.type}
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
        <div className="flex items-center justify-center">
          <span className="w-2 h-2 mx-[2px] bg-white rounded-full animate-loader"></span>
          <span
            className="w-2 h-2 mx-[2px] bg-white rounded-full animate-loader"
            style={{ animationDelay: '0.2s' }}
          ></span>
          <span
            className="w-2 h-2 mx-[2px] bg-white rounded-full animate-loader"
            style={{ animationDelay: '0.4s' }}
          ></span>
        </div>
      )}
    </button>
  )
}

export default Button
