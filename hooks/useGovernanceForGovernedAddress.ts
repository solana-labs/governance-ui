import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import useGovernanceAssets from './useGovernanceAssets'

const useGovernanceForGovernedAddress = (pubkey?: PublicKey) => {
  const { assetAccounts } = useGovernanceAssets()
  const assetAccount = useMemo(
    () =>
      pubkey &&
      assetAccounts.find((x) =>
        x.governance?.account.governedAccount.equals(pubkey)
      ),
    [assetAccounts, pubkey]
  )
  return assetAccount?.governance
}

export default useGovernanceForGovernedAddress
