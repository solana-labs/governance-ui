import { FunctionComponent } from 'react'
import Loading from '../components/Loading'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // disabled?: boolean
  isLoading?: boolean
  secondary?: boolean
  tertiary?: boolean
  inverse?: boolean
  withBorder?: boolean
  bgOverride?: string
}

export const Button: FunctionComponent<ButtonProps> = ({
  children,
  disabled,
  isLoading,
  secondary = false,
  tertiary = false,
  inverse = false,
  withBorder = false,
  bgOverride = '',
  ...props
}) => {
  let className = `z-0 relative transition-all duration-300 rounded-full font-serif text-[16px] hover:cursor-pointer disabled:cursor-not-allowed opacity-[84] disabled:opacity-50 hover:opacity-100 change-image-on-hover `

  if (secondary && !inverse) {
    // secondary
    className +=
      'py-4 px-2 bg-[#292833] font-regular text-white transition-to-white-background hover:text-[#292833]'
  } else if (secondary && inverse) {
    // secondary inverse
  } else if (tertiary) {
    className += 'py-4 px-2 font-regular hover:bg-white/10'
  } else if (withBorder) {
    className +=
      'py-4 px-2 font-regular border border-white transition-to-white-background hover:text-black disabled:text-white'
  } else if (inverse) {
    // primary inverse
    className +=
      'px-7 py-4 md:py-6 bg-[#201f27] transition-to-gradient-background hover:text-[#292833]'
  } else {
    // primary
    className +=
      'py-4 px-2 font-normal text-black bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] transition-to-white-background'
  }

  if (isLoading) {
    className += ` flex items-center`
  }

  if (bgOverride) {
    className += ` bg-none ${bgOverride}`
  }

  return (
    <button className={className} {...props} disabled={disabled || isLoading}>
      {isLoading ? (
        <div className="w-24">
          <Loading />
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
