import { createElement } from 'react'

export default function Text({ as = 'text-base', className = '', children }) {
  let classNames = className
  if (as === 'text-base') {
    classNames += `text-[14px] md:text-[18px] leading-[19.6px] md:leading-[25.2px] opacity-70`
  } else if (as === 'text-sm') {
    classNames += `text-[14px] tracking-tight leading-[19.6px] text-red`
  } else if (as === 'text-xs') {
    classNames += `text-[12px]font-normal leading-[16.8px] opacity-70`
  }

  return createElement(as, { className: classNames }, children)
}
