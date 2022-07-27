import { useEffect, useState } from 'react'
import { PublicKey, ConfirmedSignatureInfo } from '@solana/web3.js'

import useWalletStore from 'stores/useWalletStore'
import { Result, Status } from '@utils/uiTypes/Result'

const TEN_MINUTES = 1000 * 60 * 10

interface CachedData {
  time: number
  values: ConfirmedSignatureInfo[]
}

const cache: Map<string, CachedData> = new Map()

export default function useAccountActivity(accountAddress: string) {
  const [result, setResult] = useState<Result<ConfirmedSignatureInfo[]>>({
    status: Status.Pending,
  })
  const connection = useWalletStore((s) => s.connection.current)

  useEffect(() => {
    const cacheKey = accountAddress
    const cachedValue = cache.get(cacheKey)

    if (cachedValue) {
      if (cachedValue.time + TEN_MINUTES > Date.now()) {
        setResult({ status: Status.Ok, data: cachedValue.values })
        return
      } else {
        setResult({ status: Status.Stale, data: cachedValue.values })
      }
    } else {
      setResult({ status: Status.Pending })
    }

    connection
      .getConfirmedSignaturesForAddress2(
        new PublicKey(accountAddress),
        {
          limit: 5,
        },
        'confirmed'
      )
      .then((values) => {
        cache.set(cacheKey, { values, time: Date.now() })
        setResult({ status: Status.Ok, data: values })
      })
      .catch((e) =>
        setResult({
          status: Status.Failed,
          error: e instanceof Error ? e : new Error(e),
        })
      )
  }, [accountAddress])

  return result
}
