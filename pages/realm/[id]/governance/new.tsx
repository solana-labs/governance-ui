import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'

import { NewWallet } from '@hub/components/NewWallet'
import { ECOSYSTEM_PAGE } from '@hub/lib/constants'

export default function NewWalletPage() {
  const router = useRouter()
  const { id, governanceId } = router.query

  if (typeof governanceId !== 'string') {
    throw new Error('Not a valid wallet address')
  }

  const governanceAddress = new PublicKey(governanceId)

  useEffect(() => {
    if (id === ECOSYSTEM_PAGE.toBase58()) {
      router.replace('/ecosystem')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [id])

  if (id === ECOSYSTEM_PAGE.toBase58()) {
    return <div />
  }

  return (
    <div>
      <Head>
        <title>Edit Wallet Rules</title>
        <meta property="og:title" content="Edit Wallet" key="title" />
      </Head>
      <NewWallet
        className="min-h-screen"
        realmUrlId={id as string}
        governanceAddress={governanceAddress}
      />
    </div>
  )
}
