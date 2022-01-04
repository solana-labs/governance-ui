import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { notify } from '@utils/notifications'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

const gallery = () => {
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const governancePk = router?.query?.governancePk
  const [nfts, setNfts] = useState<any[]>([])
  useEffect(() => {
    const getAllNftData = async () => {
      try {
        const nfts = await getParsedNftAccountsByOwner({
          publicAddress: governancePk,
          connection: connection.current,
        })
        const data = Object.keys(nfts).map((key) => nfts[key])
        const arr: any[] = []
        for (let i = 0; i < data.length; i++) {
          const val = (await axios.get(data[i].data.uri)).data
          arr.push(val)
        }
        setNfts(arr)
      } catch (error) {
        notify({
          type: 'error',
          message: 'Unable to fetch nfts',
        })
      }
    }
    if (governancePk) {
      getAllNftData()
    }
  }, [governancePk, connection.endpoint])
  return (
    <div className="flex flex-row flex-wrap gap-4">
      {nfts.map((x, idx) => (
        <img
          className="bg-bkg-2 cursor-pointer default-transition rounded-lg border border-transparent hover:border-primary-dark"
          width={150}
          height={230}
          key={idx}
          src={x.image}
        />
      ))}
    </div>
  )
}

export default gallery
