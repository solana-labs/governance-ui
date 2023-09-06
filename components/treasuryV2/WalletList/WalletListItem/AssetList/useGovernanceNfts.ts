import { SUPPORT_CNFTS } from '@constants/flags'
import {
  DasNftObject,
  useDigitalAssetsByOwner,
} from '@hooks/queries/digitalAssets'
import useTreasuryAddressForGovernance from '@hooks/useTreasuryAddressForGovernance'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'

const useGovernanceNfts = (governance: PublicKey | undefined) => {
  const { result: treasury } = useTreasuryAddressForGovernance(governance)
  const { data: governanceNfts } = useDigitalAssetsByOwner(governance)
  const { data: treasuryNfts } = useDigitalAssetsByOwner(treasury)

  const nfts = useMemo(
    () =>
      governanceNfts && treasuryNfts
        ? ([...governanceNfts, ...treasuryNfts] as DasNftObject[])
            .flat()
            .filter((x) => SUPPORT_CNFTS || !x.compression.compressed)
        : undefined,
    [governanceNfts, treasuryNfts]
  )

  return nfts
}

export default useGovernanceNfts
