import { PublicKey } from '@solana/web3.js'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useMemo } from 'react'
import { useEffect } from 'react'
import { RealmInfo } from '../../@types/types'
import useWalletStore from '../../stores/useWalletStore'
import moment from 'moment'

export const REALMS: RealmInfo[] = [
  {
    symbol: 'MNGO',
    programId: new PublicKey('GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J'),
    realmId: new PublicKey('DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE'),
  },
]

export const ProposalStateLabels = {
  0: 'Draft',
  1: 'Draft',
  2: 'Active',
  3: 'Approved',
  4: 'Approved',
  5: 'Approved',
  6: 'Cancelled',
  7: 'Denied',
  8: 'Error',
}

const DAO = () => {
  const router = useRouter()
  const { symbol } = router.query

  const { fetchRealm } = useWalletStore((s) => s.actions)
  const governances = useWalletStore((s) => s.governances)
  const proposals = useWalletStore((s) => s.proposals)
  const votes = useWalletStore((s) => s.votes)

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
    return Object.fromEntries(
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
  }, [realmGovernances, proposals])

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
                <p>
                  {moment.unix(v.info.votingCompletedAt.toNumber()).fromNow()}
                </p>
                <p>{ProposalStateLabels[v.info.state]}</p>
                <p>Votes {JSON.stringify(votes[k])}</p>
              </a>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

export default DAO
