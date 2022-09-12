import { useEffect, useState } from 'react'
import { Connection, PublicKey, ConfirmedSignatureInfo } from '@solana/web3.js'

import useWalletStore from 'stores/useWalletStore'
import { Result, Status, Ok, isFailed, isOk } from '@utils/uiTypes/Result'

const TEN_MINUTES = 1000 * 60 * 10

interface CachedData {
  time: number
  values: ConfirmedSignatureInfo[]
}

const cache: Map<string, CachedData> = new Map()

async function getInfo(
  address: string,
  connection: Connection
): Promise<Result<ConfirmedSignatureInfo[]>> {
  const cachedValue = cache.get(address)

  if (cachedValue && cachedValue.time + TEN_MINUTES > Date.now()) {
    return { _tag: Status.Ok, data: cachedValue.values }
  }

  return connection
    .getConfirmedSignaturesForAddress2(
      new PublicKey(address),
      {
        limit: 10,
      },
      'confirmed'
    )
    .then((values) => {
      cache.set(address, { values, time: Date.now() })
      return { _tag: Status.Ok, data: values } as Ok<ConfirmedSignatureInfo[]>
    })
    .catch((e) => ({
      _tag: Status.Failed,
      error: e instanceof Error ? e : new Error(e),
    }))
}

export default function useAccountActivity(accountAddress: string | string[]) {
  const [result, setResult] = useState<Result<ConfirmedSignatureInfo[]>>({
    _tag: Status.Pending,
  })
  const connection = useWalletStore((s) => s.connection.current)
  const addresses = Array.isArray(accountAddress)
    ? accountAddress
    : [accountAddress]

  useEffect(() => {
    setResult({ _tag: Status.Pending })

    Promise.all(addresses.map((address) => getInfo(address, connection))).then(
      (results) => {
        const oks = results.filter(isOk)
        const fails = results.filter(isFailed)

        if (oks.length) {
          const values = oks
            .map(({ data }) => data)
            .flat()
            .sort((a, b) => (b.blockTime || 0) - (a.blockTime || 0))
            .slice(0, 10)

          setResult({
            _tag: Status.Ok,
            data: values,
          })
        } else if (fails.length) {
          setResult({
            _tag: Status.Failed,
            error: fails[0].error,
          })
        } else {
          setResult({
            _tag: Status.Failed,
            error: new Error('Unknown Error'),
          })
        }
      }
    )
  }, [addresses.join('-')])

  return result
}
