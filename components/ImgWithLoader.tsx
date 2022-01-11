import { useState } from 'react'
import Loading from './Loading'

const ImgWithLoader = (props) => {
  const [isLoading, setIsLoading] = useState(true)
  return (
    <div className="relative">
      {isLoading && <Loading className="absolute"></Loading>}
      <img {...props} onLoad={() => setIsLoading(false)} />
    </div>
  )
}

export default ImgWithLoader
