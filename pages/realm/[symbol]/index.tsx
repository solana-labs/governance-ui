import { useEffect } from 'react'
import { useRouter } from 'next/router'
const Index = () => {
  const router = useRouter()
  useEffect(() => {
    router.push(`/dao/${router.query.symbol}`)
  }, [router.query.symbol])

  return <></>
}

export default Index
