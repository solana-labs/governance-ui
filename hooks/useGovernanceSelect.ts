import { PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { useRealmGovernancesQuery } from './queries/governance'

const useGovernanceSelect = (initialSelection?: PublicKey) => {
  const [selection, setSelection] = useState(initialSelection)
  const { data: governances } = useRealmGovernancesQuery()
  const selectionOrDefault = useMemo(
    () => selection ?? governances?.[0]?.pubkey,
    [governances, selection]
  )

  return [selectionOrDefault, setSelection] as const
}
export default useGovernanceSelect
