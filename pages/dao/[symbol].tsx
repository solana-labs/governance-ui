import { PublicKey } from '@solana/web3.js'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useMemo } from 'react'
import { useEffect } from 'react'
import { RealmInfo } from '../../@types/types'
import useWalletStore from '../../stores/useWalletStore'

export const REALMS: RealmInfo[] = [
  {
    symbol: 'MNGO',
    programId: new PublicKey('GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J'),
    realmId: new PublicKey('DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE'),
  },
]

const DAO = () => {
  const router = useRouter()
  const { symbol } = router.query

  const { fetchRealm } = useWalletStore((s) => s.actions)
  const governances = useWalletStore((s) => s.governances)
  const proposals = useWalletStore((s) => s.proposals)

  const realmInfo = useMemo(() => REALMS.find((r) => r.symbol === symbol), [
    symbol,
  ])

  useEffect(() => {
    if (realmInfo) {
      fetchRealm(realmInfo.programId, realmInfo.realmId)
    }
  }, [realmInfo])

  const realmGovernances = useMemo(() => {
    return realmInfo
      ? Object.fromEntries(
          Object.entries(governances).filter(([_k, v]) =>
            v.info.realm.equals(realmInfo.realmId)
          )
        )
      : {}
  }, [realmInfo, governances])

  const realmProposals = useMemo(() => {
    return realmInfo
      ? Object.fromEntries(
          Object.entries(proposals)
            .filter(
              ([_k, v]) =>
                Object.keys(realmGovernances).includes(
                  v.info.governance.toBase58()
                ) && v.info.votingAtSlot
            )
            .sort(
              (a, b) =>
                b[1].info.votingAt.toNumber() - a[1].info.votingAt.toNumber()
            )
        )
      : {}
  }, [realmInfo, realmGovernances, proposals])

  return (
    <>
      <div className="m-10">
        <h1>{symbol}</h1>
        <p>Proposals:</p>
        {Object.entries(realmProposals).map(([k, v]) => (
          <div className="m-10 p-4 border" key={k}>
            <Link href={`/proposal/${k}`}>
              <a>
                <h3>{v.info.name}</h3>
                <p>{v.info.descriptionLink}</p>
                <p>{v.info.state}</p>
              </a>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

export default DAO
