import styled from '@emotion/styled'
import tw from 'twin.macro'
import classNames from 'classnames'

export const StyledLabel = styled.div`
  ${tw`mb-1.5 text-sm text-fgd-1`}
`
export const StyledSuffix = styled.div`
  ${tw`absolute right-0 text-xs flex items-center pr-2 h-full bg-transparent text-fgd-4`}
`
export const StyledSubLabel = styled.div`
  ${tw`mb-1.5 text-sm text-fgd-3 ml-2`}
`

export interface InputClasses {
  className?: string
  disabled?: boolean
  error: string
  noMaxWidth?: boolean
  useDefaultStyle?: boolean
  showErrorState?: boolean
}

export const inputClasses = ({
  className = '',
  disabled,
  error,
  noMaxWidth = false,
  useDefaultStyle = true,
  showErrorState = false,
}: InputClasses) => {
  const disabledStyle =
    'cursor-not-allowed opacity-50 text-fgd-3 border bg-bkg-1 border-bkg-4'

  const defaultStyle = `${
    disabled
      ? disabledStyle
      : classNames(
          'bg-bkg-1',
          'focus:outline-none',
          !showErrorState && 'hover:border-primary-light',
          !showErrorState && 'focus:border-primary-light'
        )
  } px-3 py-2 h-auto w-full border default-transition text-sm text-fgd-1 rounded-md ${className}`

  return `
    ${
      useDefaultStyle
        ? defaultStyle
        : `${disabled && disabledStyle} ${className}`
    }
    ${!noMaxWidth && 'max-w-lg'}
    ${error || showErrorState ? 'border-red' : 'border-fgd-3'}
  `
}
