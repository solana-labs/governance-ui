import { useState } from 'react'
import { PhotographIcon } from '@heroicons/react/outline'
import OutsideSrcImg from './OutsideSrcImg'

const ImgWithLoader = (props) => {
  const [isLoading, setIsLoading] = useState(true)
  return (
    <div className="relative">
      {isLoading && (
        <PhotographIcon className="absolute animate-pulse h-1/4 w-1/4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-fgd-3 z-10" />
      )}
      <OutsideSrcImg {...props} onLoad={() => setIsLoading(false)} />
    </div>
  )
}

export default ImgWithLoader
