import styled from '@emotion/styled'
import tw from 'twin.macro'

export const StyledPrefix = styled.div`
  ${tw`flex items-center p-2 
  bg-bkg-2 h-full rounded rounded-r-none text-left`}
`
export const StyledSuffix = styled.div`
  ${tw`absolute right-0 text-xs flex items-center pr-2 h-full bg-transparent text-fgd-4`}
`
export const inputClasses = ({ className, disabled, prefix }) => {
  return `${
    className ? className : ''
  } font-display px-2 py-2 w-full bg-bkg-1 rounded text-fgd-1 
		border border-fgd-4 default-transition hover:border-primary-dark 
		focus:border-primary-light focus:outline-none 
		${disabled ? 'cursor-not-allowed hover:border-fgd-4 text-fgd-3' : ''}
		  ${prefix ? 'rounded-l-none' : ''}`
}
