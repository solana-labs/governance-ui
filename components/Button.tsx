import { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import tw from 'twin.macro'

type StyledButtonProps = {
  secondary: boolean
}

const StyledButton = styled.button<StyledButtonProps>`
  :before {
    ${tw`absolute left-0 top-0 opacity-0 h-full w-full block bg-gradient-to-tl from-secondary-1-light via-secondary-1-dark to-secondary-2-light transition-opacity duration-500`}
    border-radius: inherit;
    content: '';
    z-index: -10;
  }

  :hover {
    :before {
      ${tw`opacity-100`};
      ${({ disabled, secondary }) => (disabled || secondary) && tw`hidden`}
    }
  }

  :focus {
    ${tw`ring-4 ring-secondary-2-light ring-opacity-40`}
    ${({ secondary }) => secondary && tw`ring-0`}
  }

  :active {
    :before {
      ${tw`ring-4 ring-secondary-2-light ring-opacity-40`}
    }
  }

  ${({ secondary }) => secondary && tw`bg-none`}
`

interface ButtonProps {
  onClick?: (x?) => void
  disabled?: boolean
  className?: string
  secondary?: boolean
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className,
  secondary = false,
  ...props
}) => {
  return (
    <StyledButton
      onClick={onClick}
      disabled={disabled}
      className={`${className} bg-gradient-to-br from-secondary-1-light via-secondary-1-dark to-secondary-2-light relative z-10 default-transition px-6 py-2 rounded-lg text-fgd-1 hover:bg-bkg-3 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60`}
      secondary={secondary}
      {...props}
    >
      {children}
    </StyledButton>
  )
}

export default Button
