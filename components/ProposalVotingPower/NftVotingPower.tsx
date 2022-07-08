import classNames from 'classnames'
import { BigNumber } from 'bignumber.js'

import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'

interface Props {
  className?: string
}

export default function NftVotingPower(props: Props) {
  const nfts = useNftPluginStore((s) => s.state.votingNfts)
  const votingPower = useNftPluginStore((s) => s.state.votingPower)
  const maxWeight = useNftPluginStore((s) => s.state.maxVoteRecord)

  const displayNfts = nfts.slice(0, 3)
  const remainingCount = Math.max(nfts.length - 3, 0)
  const max = maxWeight
    ? new BigNumber(maxWeight.account.maxVoterWeight.toString())
    : null
  const amount = new BigNumber(votingPower.toString())

  return (
    <div
      className={classNames(props.className, 'p-3', 'rounded-md', 'bg-bkg-1')}
    >
      <div className="text-white/50 text-xs">My NFT Votes</div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-white flex items-center gap-1">
          {displayNfts.slice(0, 3).map((nft, index) => (
            <div
              className="h-12 w-12 rounded-sm bg-bkg-2 bg-cover"
              key={nft.tokenAddress + index}
              style={{ backgroundImage: `url("${nft.val.image}")` }}
            />
          ))}
          {!!remainingCount && (
            <div className="text-sm text-white ml-2">
              +{remainingCount} more
            </div>
          )}
        </div>
        {max && (
          <div className="text-[11px] leading-[15px] text-white/70 text-right">
            {amount.shiftedBy(2).dividedBy(max).toFixed(2)}% of total
            <br />
            voting power
          </div>
        )}
      </div>
    </div>
  )
}
