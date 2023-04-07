import { useEffect, useState } from 'react'

export const useUnixNow = () => {
  const [unixNow, setUnixNow] = useState<number | undefined>()

  useEffect(() => {
    setUnixNow(Math.round(new Date().getTime() / 1000))
  }, [setUnixNow])

  return { unixNow }
}
