import styled from '@emotion/styled'
import tw from 'twin.macro'

const idleGradient = 'bg-gradient-to-r from-secondary-2-light to-primary-light'
const activeGradient =
  'bg-gradient-to-bl from-secondary-1-light via-primary-dark to-secondary-2-light'

const Button = styled.button`
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

export default Button
