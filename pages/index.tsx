import { useEffect } from 'react'
import { useRouter } from 'next/router'
const Index = () => {
  const router = useRouter()

  useEffect(() => {
    const { REALM } = process.env
    const mainUrl = REALM ? `/dao/${REALM}` : '/realms'
    router.replace(mainUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])

  return null
}

export default Index
