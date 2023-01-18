import { useEffect } from 'react'
import { useRouter } from 'next/router'
const Index = () => {
  const router = useRouter()
  const REALM_SYMBOL = process?.env?.REALM_SYMBOL
  useEffect(() => {
    const mainUrl = REALM_SYMBOL ? `/dao/${REALM_SYMBOL}` : '/realms'
    router.replace(mainUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [REALM_SYMBOL])

  return null
}

export default Index
