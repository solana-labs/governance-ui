import { createElement } from 'react'
export default function Text({
  level = '1',
  className = '',
  bold = false,
  as = 'div',
  children,
}) {
  let classNames = bold ? 'font-bold' : ''
  if (level === '1') {
    classNames += ` body-base`
  } else if (level === '2') {
    classNames += ` body-sm`
  } else if (level === '3') {
    classNames += ` body-xs`
  }

  classNames += ` ${className}`

  return createElement(as, { className: classNames }, children)
}
