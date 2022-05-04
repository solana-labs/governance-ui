import { createElement } from 'react'

export default function Header({
  as = 'h2',
  withGradient = false,
  className = '',
  children,
}) {
  let classNames = className
  if (as === 'h1') {
    classNames += `text-[40px] md:text-[70px] font-medium leading-[44px] md:leading-[70px]`
  } else if (as === 'h2') {
    classNames += `text-[24px] md:text-[36px] font-normal tracking-tight leading-[26.4px] md:leading-[39.6px]`
  } else if (as === 'h3') {
    classNames += `text-[20px] md:text-[24px] font-normal leading-[22px] md:leading-[26.4px]`
  } else if (as === 'h4') {
    classNames += `text-[16px]  md:text-[20px] font-normal leading-[17.6px] md:leading-[22px]`
  }

  if (withGradient) {
    classNames += ` bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text text-transparent`
  }

  return createElement(as, { className: classNames }, children)
}
