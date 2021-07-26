import { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import tw from 'twin.macro'

const StyledButton = styled.a`
  font-weight: 700;
  cursor: pointer;

  :hover {
    ${tw`underline`}
  }

  :disabled {
    ${tw`cursor-not-allowed opacity-60`}
  }
`

// default heroicon does not allow customizing stroke
const ChevronRightIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
  </svg>
)

interface LinkLeftProps {
  className?: string
  href?: string
}

const LinkLeft: FunctionComponent<LinkLeftProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <StyledButton
      className={`${className} flex z-10 text-mango-yellow relative rounded-full`}
      {...props}
    >
      {children}
      <ChevronRightIcon
        className={`relative stroke-2 top-1 h-4 w-4 text-fgd-1 ml-1`}
      />
    </StyledButton>
  )
}

export default LinkLeft
