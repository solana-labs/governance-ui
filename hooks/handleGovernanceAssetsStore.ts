import { useEffect } from 'react'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import useWalletStore from 'stores/useWalletStore'
import { usePrevious } from './usePrevious'
import useRealm from './useRealm'
import { useRealmQuery } from './queries/realm'

export default function useHandleGovernanceAssetsStore() {
  const realm = useRealmQuery().data?.result
  const { governances } = useRealm()
  const previousStringifyGovernances = usePrevious(
    JSON.stringify(Object.keys(governances))
  )
  const connection = useWalletStore((s) => s.connection)
  const { setGovernancesArray } = useGovernanceAssetsStore()
  useEffect(() => {
    if (
      realm &&
      previousStringifyGovernances !== JSON.stringify(Object.keys(governances))
    ) {
      setGovernancesArray(connection, realm, governances)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    JSON.stringify(Object.keys(governances)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    realm?.pubkey.toBase58(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    realm?.account.authority?.toBase58(),
  ])
}
