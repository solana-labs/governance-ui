import { NewProposal } from './components/NewProposal/NewProposal'
import React from 'react'

const New = () => {
  return (
    <div className="dark w-full max-w-3xl mx-auto">
      <div className="dark:bg-neutral-900 rounded px-4 lg:px-8">
        <NewProposal />
      </div>
    </div>
  )
}

export default New
