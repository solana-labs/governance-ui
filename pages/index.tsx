import { useEffect } from 'react'
import { useRouter } from 'next/router'
const Index = () => {
  const router = useRouter()

  useEffect(() => {
    const { DAO } = process.env
    const mainUrl = DAO ? `/dao/${DAO}` : '/realms'
    router.push(mainUrl)
  }, [])

  return <></>
}

export default Index
