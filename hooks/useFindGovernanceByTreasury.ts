import { fetchRealmByPubkey } from './queries/realm'
import { fetchRealmGovernances } from './queries/governance'
import { useConnection } from '@solana/wallet-adapter-react'
import useSelectedRealmPubkey from './selectedRealm/useSelectedRealmPubkey'
import { getNativeTreasuryAddress } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

const useFindGovernanceByTreasury = () => {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()

  // we want to be able to select by governance or treasury pk in some cases where we don't know.
  const findGovernanceByTreasury = async (pk: PublicKey) => {
    if (!realmPk)
      throw new Error(
        'Race  condition, needs to be solved by making useSelectedRealmPubkey not async'
      )

    const { result: realm } = await fetchRealmByPubkey(connection, realmPk)
    if (!realm) throw new Error()

    const governances = await fetchRealmGovernances(connection, realmPk)
    const treasuries = await Promise.all(
      governances.map((x) => getNativeTreasuryAddress(realm.owner, x.pubkey))
    )

    const index = treasuries.findIndex((x) => x.equals(pk))
    const governanceForTreasury =
      index === -1 ? undefined : governances[index].pubkey
    return governanceForTreasury
  }
  return findGovernanceByTreasury
}

export default useFindGovernanceByTreasury
