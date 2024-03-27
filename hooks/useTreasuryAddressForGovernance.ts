import { getNativeTreasuryAddress } from '@solana/spl-governance'
import { useAsync } from 'react-async-hook'
import { useRealmQuery } from './queries/realm'
import { PublicKey } from '@solana/web3.js'

const useTreasuryAddressForGovernance = (governance: PublicKey | undefined) => {
  const realm = useRealmQuery().data?.result

  return useAsync(
    async () =>
      governance && realm?.owner
        ? await getNativeTreasuryAddress(realm.owner, governance)
        : undefined,
    [governance, realm?.owner]
  )
}

export default useTreasuryAddressForGovernance
