import { NewWallet } from '@hub/components/NewWallet/NewWallet'
import React from 'react'

const New = () => {
  return (
    <div className="dark w-full max-w-3xl mx-auto">
      <div className="dark:bg-neutral-900 rounded px-4 lg:px-8">
        <NewWallet />
      </div>
    </div>
  )
}

export default New
