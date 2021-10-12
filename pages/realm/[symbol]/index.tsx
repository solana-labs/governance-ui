import { useEffect } from 'react'
import { useRouter } from 'next/router'
import useRealmContext from '../../../hooks/useRealmContext'
const Index = () => {
  const router = useRouter()
  const { generateUrlWithClusterParam } = useRealmContext()
  useEffect(() => {
    router.push(generateUrlWithClusterParam(`/dao/${router.query.symbol}`))
  }, [router.query.symbol])

  return <></>
}

export default Index
