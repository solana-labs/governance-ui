import { createElement } from 'react'

export default function Header({
  as = 'h2',
  withGradient = false,
  className = '',
  children,
}) {
  let classNames = className
  // if (as === 'h1') {
  //   classNames += ` `
  // } else if (as === 'h2') {
  //   classNames += ` `
  // } else if (as === 'h3') {
  //   classNames += ` `
  // } else if (as === 'h4') {
  //   classNames += ` `
  // }

  if (withGradient) {
    classNames += ` bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text text-transparent`
  }

  return createElement(as, { className: classNames }, children)
}
