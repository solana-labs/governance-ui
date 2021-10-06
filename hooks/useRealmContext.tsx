import { useRouter } from 'next/router'

export default function useRealmContext() {
  const router = useRouter()
  const urlContext = router.asPath.includes('realm') ? 'realm' : 'dao'
  return {
    urlContext,
  }
}
