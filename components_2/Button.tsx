import { FunctionComponent, useState } from 'react'
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
  let className = `z-0 relative transition-all duration-300 rounded-full font-serif text-[16px] hover:cursor-pointer opacity-[84] hover:opacity-100 change-image-on-hover focus:border `

  if (secondary && !inverse) {
    // secondary (Explore DAO)
    className += `py-3 px-2 h-[48px] md:h-[56px] md:w-[208px] ${bgOverride} font-regular text-white hover:bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] hover:text-[#292833] active:opacity-70`
  } else if (secondary && inverse) {
    // secondary inverse (Read Docs)
  } else if (tertiary) {
    className +=
      'py-3 px-2 h-[48px] md:h-[56px] w-[208px] font-regular hover:bg-white/10 active:bg-white/5'
  } else if (withBorder) {
    // (Read SPL Gov)
    className +=
      'py-3 px-2 h-[48px] md:h-[56px] font-regular border border-white hover:text-black hover:bg-white active:bg-white/70'
  } else if (inverse) {
    // primary inverse (Create DAO Type)
    className +=
      'px-7 py-4 md:py-6 bg-[#201f27] transition-to-gradient-background hover:text-[#292833]'
  } else {
    // primary (Create DAO)
    className +=
      // 'py-4 w-[208px] h-[56px] md:h-[64px] font-normal text-black bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] hover:bg-white active:bg-white/70'
      'py-4 w-[208px] h-[56px] md:h-[64px] font-normal text-black bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] transition-to-white-background active:opacity-70'
    // transition-to-white-background
  }

  if (isLoading) {
    className += ` flex items-center`
  }

  if (bgOverride) {
    className += ` bg-none ${bgOverride}`
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

export const ExploreButton = ({ bgOverride }) => {
  const [isHovering, setIsHovered] = useState(false)
  const onMouseEnter = () => setIsHovered(true)
  const onMouseLeave = () => setIsHovered(false)

  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Button secondary bgOverride={bgOverride}>
        <div className="relative flex items-center justify-center bg-[#]">
          <div
            className={`${bgOverride} rounded-full ml-2 mr-2 p-2 absolute left-[-0.5rem]`}
          >
            <div
              className={` ${
                isHovering
                  ? 'bg-[url(/img/realms-web/icons/binoculars-white.png)] '
                  : 'bg-[url(/img/realms-web/icons/binoculars-blue.png)] '
              }
          w-5 h-5 bg-cover overflow-hidden text-transparent`}
            >
              Binoculars
            </div>
          </div>
          <div className="relative px-8 left-[0.5rem]">
            <div className="md:hidden">Explore</div>
            <div className="hidden md:block">Explore DAOs</div>
          </div>
        </div>
      </Button>
    </div>
  )
}

export const ReadTheDocsButton = () => {
  return (
    <Button tertiary>
      <div className="relative flex items-center justify-center">
        <div className="pl-4 pr-2">Read the Docs</div>
        <img
          src="/img/realms-web/icons/external-link-white.png"
          className="w-3 h-3 mr-4"
          alt="External link icon"
        />
      </div>
    </Button>
  )
}
