import { FunctionComponent } from 'react'
import Loading from '../components/Loading'

interface ButtonProps {
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  secondary?: boolean
  tertiary?: boolean
  inverse?: boolean
  withBorder?: boolean
}

export const Button: FunctionComponent<ButtonProps> = ({
  children,
  disabled,
  isLoading,
  secondary = false,
  tertiary = false,
  inverse = false,
  withBorder = false,
  ...props
}) => {
  let className = `z-0 relative transition-all duration-300 rounded-full font-serif text-[16px] hover:cursor-pointer opacity-[84] hover:opacity-100 change-image-on-hover `

  if (secondary && !inverse) {
    // secondary
    className +=
      'py-3 px-2 bg-[#292833] font-regular text-white transition-to-white-background hover:text-[#292833]'
  } else if (secondary && inverse) {
    // secondary inverse
  } else if (tertiary) {
    className += 'py-3 px-2 font-regular hover:bg-white/10'
  } else if (withBorder) {
    className +=
      'py-3 px-2 font-regular border border-white transition-to-white-background hover:text-black'
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

export default Button
