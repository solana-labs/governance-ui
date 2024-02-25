import React from 'react'
import { useInView } from 'react-intersection-observer'
import Comment from './Comment'
import { ChatMessage } from '@solana/spl-governance'

const LazyLoadComment = ({ chatMessage }: { chatMessage: ChatMessage }) => {
  const { ref, inView } = useInView({
    /* Optional options */
    triggerOnce: true,
  })

  return (
    <div ref={ref} className="min-h-[40px]">
      <div>{inView && <Comment chatMessage={chatMessage} />}</div>
    </div>
  )
}

export default LazyLoadComment
