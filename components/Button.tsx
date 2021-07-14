import { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import tw from 'twin.macro'

type StyledButtonProps = {
  disabled: boolean
  secondary: boolean
}

const idleGradient = 'bg-gradient-to-r from-secondary-2-light to-primary-light'
const activeGradient =
  'bg-gradient-to-bl from-secondary-1-light via-primary-dark to-secondary-2-light'

export const PrimaryButton = styled.button`
  ${tw`relative z-10 px-8 py-2 rounded-full text-fgd-1 ${idleGradient}`}

  :before {
    ${tw`absolute left-0 top-0 opacity-0 h-full w-full block transition-opacity duration-500 ${activeGradient}`}
    border-radius: inherit;
    content: '';
    z-index: -10;
  }

  :hover {
    :before {
      ${tw`opacity-100`}
    }
  }

  focus {
    ${tw`ring-2 ring-secondary-2-light ring-opacity-40 outline-none`}
  }

  :active {
    :before {
      ${tw`ring-2 ring-secondary-2-light ring-opacity-40`}
    }
  }

  :disabled {
    ${tw`cursor-not-allowed opacity-60`}
    :before {
      ${tw`hidden`}
    }
  }
`

export const SecondaryButton = styled.button`
  ${tw`relative z-10 px-8 py-2 rounded-full text-fgd-1`}

  :hover {
    ${tw`underline`}
  }

  :disabled {
    ${tw`cursor-not-allowed opacity-60`}
  }
`

// use before as an overlay to have nice alpha transitions
export const StyledButton = styled.button<StyledButtonProps>`
  :before {
    ${tw`absolute left-0 top-0 opacity-0 h-full w-full block transition-opacity duration-500`}
    ${({ secondary, disabled }) =>
      !secondary && !disabled && tw`${activeGradient}`}
    border-radius: inherit;
    content: '';
    z-index: -10;
  }

  :hover {
    ${({ secondary }) => secondary && tw`underline`}

    :before {
      ${tw`opacity-100`};
      ${({ disabled }) => disabled && tw`hidden`}
    }
  }

  :focus {
    ${tw`ring-2 ring-secondary-2-light ring-opacity-40 outline-none`}
    ${({ secondary }) => secondary && tw`ring-0`}
  }

  :active {
    :before {
      ${tw`ring-2 ring-secondary-2-light ring-opacity-40`}
      ${({ secondary }) => secondary && tw`ring-0`}
    }
  }

  :disabled {
    ${tw`cursor-not-allowed opacity-60`}
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
      className={`${className} relative z-10 px-8 py-2 rounded-full text-fgd-1 ${idleGradient}`}
      secondary={secondary}
      {...props}
    >
      {children}
    </StyledButton>
  )
}

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

export const ButtonWithChevronRight: FunctionComponent<ButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <Button className={`${className} pr-5 flex`} {...props}>
      {children}{' '}
      <ChevronRightIcon
        className={`relative stroke-3 top-1 h-4 w-4 text-fgd-1 ml-1`}
      />
    </Button>
  )
}
export default Button
