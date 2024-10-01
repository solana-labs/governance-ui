import { BN } from '@coral-xyz/anchor'
import { abbreviateAddress } from '@hub/lib/abbreviateAddress'
import { formatBN } from '@utils/formatNumber'
import Loading from '@components/Loading'
import useLeaderboardRecords from '@hooks/useLeaderboardRecords'

const Leaderboard = () => {
  const { error, loading, leaders } = useLeaderboardRecords()

  if (error) {
    return (
      <div className="p-10">
        <p>{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-10">
        <Loading h="10" w="10"/>
      </div>
    )
  }

  if (!leaders?.length) {
    return (
      <div className="p-10">
        <p>No one holds voting power in this DAO.</p>
      </div>
    )
  }

  return (
    <div className="pb-4 space-y-3">
      <table className="min-w-full">
        <thead className="bg-dark-theme-bkg-3 sticky top-0">
          <tr className="border-none">
            <th>Rank</th>
            <th>Wallet</th>
            <th>Voting Power</th>
          </tr>
        </thead>
        <tbody className="border-none">
        {
          leaders?.map((l) => {
            return (
              <tr key={l.wallet} className={"text-center border-none " + (l.isYou ? "bg-green-900" : "")}>
                <td>{l.rank}</td>
                <td>{abbreviateAddress(l.wallet) + (l.isYou ? " (you)" : "")}</td>
                <td>{formatBN(l.votingPower.div(new BN(10000)), 2)}</td>
              </tr>
            )
          })
        }
        </tbody>
      </table>
    </div>
  )
}

export default Leaderboard
