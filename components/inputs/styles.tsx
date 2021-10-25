import styled from '@emotion/styled'
import tw from 'twin.macro'

export const StyledLabel = styled.div`
  ${tw`mb-1.5 text-sm text-fgd-1`}
`
export const StyledSuffix = styled.div`
  ${tw`absolute right-0 text-xs flex items-center pr-2 h-full bg-transparent text-fgd-4`}
`
export const inputClasses = ({ className, disabled, error }) => {
  return `${
    className ? className : ''
  } p-3 w-full bg-bkg-1 rounded-md text-sm text-fgd-1 
	border border-fgd-3 default-transition hover:border-primary-light 
	focus:border-primary-light focus:outline-none 
	${error ? 'border-red' : 'border-fgd-4'}
	${
    disabled
      ? 'cursor-not-allowed opacity-60 text-fgd-3 hover:border-fgd-3'
      : ''
  }`
}
