import { getProgramVersionForRealm } from '@models/registry/api'
import { RpcContext } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import useRealm from './useRealm'
import useWalletOnePointOh from './useWalletOnePointOh'
import { useRealmQuery } from './queries/realm'
import useLegacyConnectionContext from './useLegacyConnectionContext'
import { useCallback } from 'react'

export default function useRpcContext() {
  const realm = useRealmQuery().data?.result
  const { realmInfo } = useRealm()
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const getRpcContext = useCallback(
    () =>
      realm?.owner === undefined ||
      realmInfo === undefined ||
      wallet === undefined
        ? undefined
        : new RpcContext(
            new PublicKey(realm?.owner.toString()),
            getProgramVersionForRealm(realmInfo),
            wallet,
            connection.current,
            connection.endpoint
          ),
    [connection, realm?.owner, realmInfo, wallet]
  )

  return {
    getRpcContext,
  }
}
