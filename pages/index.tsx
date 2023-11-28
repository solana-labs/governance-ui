import { useEffect } from 'react'
import { useRouter } from 'next/router'

const Index = () => {
  const router = useRouter()
  // process env acting funny
  const REALM = 'Jito'

  useEffect(() => {
    const mainUrl = REALM ? `/dao/${REALM}` : '/realms'
    if (!router.asPath.includes(mainUrl)) {
      router.replace(mainUrl)
    }
  }, [REALM])

  return null
}

export default Index
