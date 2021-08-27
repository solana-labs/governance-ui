import moment from 'moment'
import { useEffect, useState } from 'react'

export const useIsBeyondTimestamp = (timestamp: number | undefined) => {
  const [isBeyondTimestamp, setIsBeyondTimestamp] = useState<
    boolean | undefined
  >()

  useEffect(() => {
    if (!timestamp) {
      return
    }

    const sub = (async () => {
      const now = moment().unix()

      if (now > timestamp) {
        setIsBeyondTimestamp(true)
        return
      }

      setIsBeyondTimestamp(false)

      const id = setInterval(() => {
        const now = moment().unix()
        if (now > timestamp) {
          setIsBeyondTimestamp(true)
          clearInterval(id!)
        }
      }, 5000) // TODO: Use actual timestamp to calculate the interval

      return id
    })()

    return () => {
      sub.then((id) => id && clearInterval(id))
    }
  }, [timestamp])

  return isBeyondTimestamp
}
