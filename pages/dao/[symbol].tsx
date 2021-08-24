import { useRouter } from 'next/router'
import Link from 'next/link'
import useWalletStore from '../../stores/useWalletStore'
import moment from 'moment'
import useRealm from '../../hooks/useRealm'

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

  const wallet = useWalletStore((s) => s.current)
  const {
    governances,
    proposals,
    votes,
    realmTokenAccount,
    ownTokenRecord,
  } = useRealm(symbol as string)

  // DEBUG print remove
  console.log(
    'governance page tokenAccount',
    realmTokenAccount && realmTokenAccount.publicKey.toBase58()
  )

  console.log(
    'governance page wallet',
    wallet?.connected && wallet.publicKey.toBase58()
  )

  console.log(
    'governance page tokenRecord',
    wallet?.connected && ownTokenRecord
  )

  return (
    <>
      <div className="m-10">
        <h1>{symbol}</h1>
        <p>
          in Wallet:{' '}
          {realmTokenAccount
            ? realmTokenAccount.account.amount.toString()
            : 'N/A'}
        </p>
        <p>
          in Governance:{' '}
          {ownTokenRecord
            ? ownTokenRecord.info.governingTokenDepositAmount.toNumber()
            : 'N/A'}
        </p>
        <p>Proposals:</p>
        {Object.entries(proposals)
          .filter(([_k, v]) => v.info.votingAt)
          .sort(
            (a, b) =>
              b[1].info.votingAt.toNumber() - a[1].info.votingAt.toNumber()
          )
          .map(([k, v]) => (
            <div className="m-10 p-4 border" key={k}>
              <Link href={`/proposal/${k}`}>
                <a>
                  <h3>{v.info.name}</h3>
                  <p>{v.info.descriptionLink}</p>

                  {v.info.votingCompletedAt ? (
                    <p>
                      Ended{' '}
                      {moment
                        .unix(v.info.votingCompletedAt.toNumber())
                        .fromNow()}
                    </p>
                  ) : (
                    <p>
                      Created{' '}
                      {moment.unix(v.info.votingAt.toNumber()).fromNow()}
                    </p>
                  )}
                  <p>{ProposalStateLabels[v.info.state]}</p>
                  <p>Votes {JSON.stringify(votes[k])}</p>
                  <p>
                    {`Yes Threshold: ${
                      governances[v.info.governance.toBase58()]?.info.config
                        .voteThresholdPercentage.value
                    }%`}
                  </p>
                </a>
              </Link>
            </div>
          ))}
      </div>
    </>
  )
}

export default DAO
