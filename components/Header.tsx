import { createElement } from 'react'

export default function Header({
  as = 'h2',
  withGradient = false,
  className = '',
  children,
}) {
  let classNames = ''
  if (as === 'h1') {
    classNames += ` heading-xl`
  } else if (as === 'h2') {
    classNames += ` heading-lg`
  } else if (as === 'h3') {
    classNames += ` heading-base`
  } else if (as === 'h4') {
    classNames += ` heading-sm`
  } else if (as === 'h5') {
    classNames += ` heading-xs`
  } else if (as === 'h6' || as === 'cta') {
    as = 'div'
    classNames += ` heading-cta`
  }

  classNames += ` ${className}`

  if (withGradient) {
    classNames += ` bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text text-transparent`
  }

  return createElement(as, { className: classNames }, children)
}
