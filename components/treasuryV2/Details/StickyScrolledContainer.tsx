import React, { useEffect, useRef } from 'react'
import cx from 'classnames'

interface Props {
  className?: string
  children?: React.ReactNode
  isAncestorStickied?: boolean
}

export default function StickyScrolledContainer(props: Props) {
  const container = useRef<HTMLDivElement>(null)

  const allowScroll =
    props.isAncestorStickied || props.isAncestorStickied === undefined

  useEffect(() => {
    if (!allowScroll && container.current) {
      container.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [container, allowScroll])

  return (
    <div
      className={cx(
        props.className,
        allowScroll ? 'overflow-y-auto' : 'overflow-hidden'
      )}
      ref={container}
    >
      {props.children}
    </div>
  )
}
