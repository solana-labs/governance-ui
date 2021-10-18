import styled from '@emotion/styled'
import tw from 'twin.macro'

export const StyledPrefix = styled.div`
  ${tw`flex items-center justify-end p-2 border border-r-0 
  border-primary-light bg-bkg-2 h-full text-xs rounded rounded-r-none w-14 text-right`}
`
export const StyledSuffix = styled.div`
  ${tw`absolute right-0 text-xs flex items-center pr-2 h-full bg-transparent text-fgd-4`}
`
export const inputClasses = ({ className, disabled, prefix, error }) => {
  return `${
    className ? className : ''
  } h-12 px-2 w-full bg-bkg-1 rounded-md text-sm text-fgd-1 
	border border-primary-light default-transition hover:border-primary-dark 
	focus:border-primary-light focus:outline-none 
	${error ? 'border-red' : 'border-fgd-4'}
	${disabled ? 'cursor-not-allowed hover:border-fgd-4 text-fgd-3' : ''}
	  ${prefix ? 'rounded-l-none' : ''}`
}
