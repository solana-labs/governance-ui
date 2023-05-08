import { getProgramVersionForRealm } from '@models/registry/api'
import { RpcContext } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import useWalletStore from 'stores/useWalletStore'
import useRealm from './useRealm'
import useWalletOnePointOh from './useWalletOnePointOh'
import { useRealmQuery } from './queries/realm'

export default function useRpcContext() {
  const realm = useRealmQuery().data?.result
  const { realmInfo } = useRealm()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()
  const getRpcContext = () =>
    new RpcContext(
      new PublicKey(realm!.owner.toString()),
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection.current,
      connection.endpoint
    )

  return {
    getRpcContext,
  }
}
