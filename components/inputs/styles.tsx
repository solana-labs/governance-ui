import styled from '@emotion/styled'
import tw from 'twin.macro'

export const StyledLabel = styled.div`
  ${tw`mb-1.5 text-sm text-fgd-1`}
`
export const StyledSuffix = styled.div`
  ${tw`absolute right-0 text-xs flex items-center pr-2 h-full bg-transparent text-fgd-4`}
`
export const inputClasses = ({
  className = '',
  disabled,
  error,
  noMaxWidth = false,
  useDefaultStyle = true,
}) => {
  const disabledStyle =
    'cursor-not-allowed opacity-50 text-fgd-3 border bg-bkg-1 border-bkg-4'

  const defaultStyle = `${
    disabled
      ? disabledStyle
      : 'hover:border-primary-light focus:border-primary-light focus:outline-none bg-bkg-1'
  } p-3 w-full border border-fgd-3 default-transition text-sm text-fgd-1 rounded-md ${className}`

  return `
    ${
      useDefaultStyle
        ? defaultStyle
        : `${disabled && disabledStyle} ${className}`
    }
    ${!noMaxWidth && 'max-w-lg'}
    ${error ? 'border-red' : 'border-fgd-4'}
  `
}
